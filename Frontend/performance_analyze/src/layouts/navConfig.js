import { FaChalkboardTeacher, FaUserGraduate, FaChartLine, FaUsers, FaSchool, FaTachometerAlt } from 'react-icons/fa';
import { MdOutlineFeedback, MdOutlineWarningAmber } from 'react-icons/md';
import { TbTargetArrow } from 'react-icons/tb';

export const navByRole = {
  admin: [
    {
      section: 'Main',
      items: [
        { to: '/admin?view=overview', label: 'Dashboard', icon: FaTachometerAlt },
        { to: '/admin?view=students', label: 'Students', icon: FaUserGraduate },
        { to: '/admin?view=analytics', label: 'Analytics', icon: FaChartLine },
      ],
    },
    {
      section: 'Management',
      items: [
        { to: '/admin?view=users', label: 'Users', icon: FaUsers },
        { to: '/admin?view=classes', label: 'Classes', icon: FaSchool },
      ],
    },
  ],
  teacher: [
    {
      section: 'Teaching',
      items: [
        { to: '/teacher?view=overview', label: 'My Class', icon: FaChalkboardTeacher },
        { to: '/teacher?view=students', label: 'Students', icon: FaUserGraduate },
        { to: '/teacher?view=risk', label: 'Risk Analysis', icon: MdOutlineWarningAmber },
      ],
    },
    {
      section: 'Tools',
      items: [{ to: '/teacher?view=feedback', label: 'Feedback', icon: MdOutlineFeedback }],
    },
  ],
  student: [
    {
      section: 'My panel',
      items: [
        { to: '/student?view=dashboard', label: 'Dashboard', icon: FaTachometerAlt },
        { to: '/student?view=progress', label: 'My Progress', icon: FaChartLine },
        { to: '/student?view=study-plan', label: 'Study Plan', icon: TbTargetArrow },
      ],
    },
  ],
};
