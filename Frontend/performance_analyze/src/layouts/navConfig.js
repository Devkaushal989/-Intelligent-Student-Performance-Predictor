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
        { to: '/teacher?view=overview', label: 'My Class', icon: '⊡' },
        { to: '/teacher?view=students', label: 'Students', icon: '👨‍🎓' },
        { to: '/teacher?view=risk', label: 'Risk Analysis', icon: '⚠️' },
      ],
    },
    {
      section: 'Tools',
      items: [{ to: '/teacher?view=feedback', label: 'Feedback', icon: '📝' }],
    },
  ],
  student: [
    {
      section: 'My panel',
      items: [
        { to: '/student?view=dashboard', label: 'Dashboard', icon: '⊡' },
        { to: '/student?view=progress', label: 'My Progress', icon: '📈' },
        { to: '/student?view=study-plan', label: 'Study Plan', icon: '🎯' },
      ],
    },
  ],
};
