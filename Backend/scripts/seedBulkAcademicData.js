require('dotenv').config();

const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const PerformanceRecord = require('../models/PerformanceRecord');
const { predictRisk } = require('../services/predictionService');

const TARGET_STUDENTS = 100;
const TARGET_TEACHERS = 8;
const RECORDS_PER_STUDENT = 6;

const classes = ['Class-9A', 'Class-9B', 'Class-10A', 'Class-10B', 'Class-11A', 'Class-11B'];
const subjects = ['Mathematics', 'Science', 'English', 'Computer Science', 'Social Studies'];

const firstNames = [
  'Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Kabir', 'Ishaan', 'Kunal', 'Rahul', 'Mayank',
  'Riya', 'Anaya', 'Diya', 'Saanvi', 'Aadhya', 'Priya', 'Meera', 'Nisha', 'Ira', 'Kavya',
];

const lastNames = [
  'Sharma', 'Verma', 'Singh', 'Kumar', 'Patel', 'Gupta', 'Mehta', 'Nair', 'Iyer', 'Joshi',
];

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const buildName = (idx) => {
  const first = firstNames[idx % firstNames.length];
  const last = lastNames[(idx * 3) % lastNames.length];
  return `${first} ${last}`;
};

const ensureTeachers = async () => {
  const teachers = [];

  for (let i = 1; i <= TARGET_TEACHERS; i += 1) {
    const email = `bulk.teacher${String(i).padStart(3, '0')}@isp.edu`;
    const existing = await User.findOne({ email });

    if (existing) {
      existing.role = 'teacher';
      existing.name = `Teacher ${i}`;
      existing.className = classes[(i - 1) % classes.length];
      existing.isActive = true;
      await existing.save();
      teachers.push(existing);
      continue;
    }

    const created = await User.create({
      name: `Teacher ${i}`,
      email,
      password: 'Teacher@123',
      role: 'teacher',
      className: classes[(i - 1) % classes.length],
      isActive: true,
    });

    teachers.push(created);
  }

  return teachers;
};

const ensureStudents = async (teachers) => {
  const students = [];

  for (let i = 1; i <= TARGET_STUDENTS; i += 1) {
    const email = `bulk.student${String(i).padStart(3, '0')}@isp.edu`;
    const teacher = teachers[(i - 1) % teachers.length];
    const className = classes[(i - 1) % classes.length];

    const existing = await User.findOne({ email });

    if (existing) {
      existing.role = 'student';
      existing.name = buildName(i);
      existing.className = className;
      existing.assignedTeacher = teacher._id;
      existing.isActive = true;
      await existing.save();
      students.push(existing);
      continue;
    }

    const created = await User.create({
      name: buildName(i),
      email,
      password: 'Student@123',
      role: 'student',
      className,
      assignedTeacher: teacher._id,
      isActive: true,
    });

    students.push(created);
  }

  return students;
};

const buildStudentTrend = () => {
  const baseAttendance = rand(58, 94);
  const baseAssignment = rand(52, 92);
  const baseExam = rand(45, 95);
  const baseParticipation = rand(48, 90);
  const baseBehavior = rand(55, 95);

  const trend = [];
  for (let i = 0; i < RECORDS_PER_STUDENT; i += 1) {
    trend.push({
      attendance: Math.max(40, Math.min(99, baseAttendance + rand(-6, 6) + i)),
      assignmentScore: Math.max(35, Math.min(99, baseAssignment + rand(-8, 8) + i)),
      examScore: Math.max(30, Math.min(99, baseExam + rand(-10, 10) + i)),
      participationScore: Math.max(30, Math.min(99, baseParticipation + rand(-7, 7))),
      behaviorScore: Math.max(35, Math.min(99, baseBehavior + rand(-5, 5))),
    });
  }

  return trend;
};

const ensurePerformanceRecords = async (students) => {
  let createdCount = 0;

  for (let i = 0; i < students.length; i += 1) {
    const student = students[i];
    const existingCount = await PerformanceRecord.countDocuments({ student: student._id });

    if (existingCount >= RECORDS_PER_STUDENT) {
      continue;
    }

    const teacherId = student.assignedTeacher;
    if (!teacherId) {
      continue;
    }

    const trend = buildStudentTrend();
    const recordsToCreate = [];

    for (let r = existingCount; r < RECORDS_PER_STUDENT; r += 1) {
      const row = trend[r];
      const examScores = trend.slice(0, r + 1).map((x) => x.examScore);

      const prediction = predictRisk({
        ...row,
        examScores,
        totalLectures: rand(36, 55),
        daysToExam: rand(5, 21),
        internalScore: rand(18, 40),
        internalMax: 40,
        finalMax: 60,
        passTarget: 40,
        averageTarget: 60,
        highTarget: 80,
      });

      const date = new Date();
      date.setMonth(date.getMonth() - (RECORDS_PER_STUDENT - r));
      date.setDate(rand(1, 25));

      recordsToCreate.push({
        student: student._id,
        teacher: teacherId,
        className: student.className || 'Unassigned',
        subject: subjects[(i + r) % subjects.length],
        attendance: row.attendance,
        assignmentScore: row.assignmentScore,
        examScore: row.examScore,
        participationScore: row.participationScore,
        behaviorScore: row.behaviorScore,
        recordedAt: date,
        prediction,
      });
    }

    if (recordsToCreate.length > 0) {
      await PerformanceRecord.insertMany(recordsToCreate);
      createdCount += recordsToCreate.length;
    }
  }

  return createdCount;
};

const run = async () => {
  try {
    await connectDB();

    const teachers = await ensureTeachers();
    const students = await ensureStudents(teachers);
    const recordsCreated = await ensurePerformanceRecords(students);

    const totalTeachers = await User.countDocuments({ email: /^bulk\.teacher\d+@isp\.edu$/i });
    const totalStudents = await User.countDocuments({ email: /^bulk\.student\d+@isp\.edu$/i });
    const totalRecords = await PerformanceRecord.countDocuments({
      student: {
        $in: students.map((s) => s._id),
      },
    });

    console.log('Bulk data seeding complete');
    console.log(`Teachers available: ${totalTeachers}`);
    console.log(`Students available: ${totalStudents}`);
    console.log(`Total linked records: ${totalRecords}`);
    console.log(`Records added in this run: ${recordsCreated}`);
    console.log('Demo student login pattern: bulk.student001@isp.edu / Student@123');
    console.log('Demo teacher login pattern: bulk.teacher001@isp.edu / Teacher@123');
  } catch (error) {
    console.error(`Bulk seed failed: ${error.message}`);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
};

run();
