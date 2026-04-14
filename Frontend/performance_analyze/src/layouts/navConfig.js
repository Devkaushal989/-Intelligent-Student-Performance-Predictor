export const navByRole = {
  admin: [
    {
      section: 'Main',
      items: [
        { to: '/admin?view=overview', label: 'Dashboard', icon: '⊡' },
        { to: '/admin?view=students', label: 'Students', icon: '👨‍🎓' },
        { to: '/admin?view=analytics', label: 'Analytics', icon: '📈' },
      ],
    },
    {
      section: 'Management',
      items: [
        { to: '/admin?view=users', label: 'Users', icon: '👥' },
        { to: '/admin?view=classes', label: 'Classes', icon: '🏫' },
      ],
    },
  ],
  teacher: [
    {
      section: 'Teaching',
      items: [
        { to: '/teacher', label: 'My class', icon: '⊡' },
        { to: '/teacher', label: 'Students', icon: '👨‍🎓' },
        { to: '/teacher', label: 'Risk analysis', icon: '⚠️' },
      ],
    },
    {
      section: 'Tools',
      items: [{ to: '/teacher', label: 'Feedback', icon: '📝' }],
    },
  ],
  student: [
    {
      section: 'My panel',
      items: [
        { to: '/student', label: 'Dashboard', icon: '⊡' },
        { to: '/student', label: 'My progress', icon: '📈' },
        { to: '/student', label: 'Study plan', icon: '🎯' },
      ],
    },
  ],
};
