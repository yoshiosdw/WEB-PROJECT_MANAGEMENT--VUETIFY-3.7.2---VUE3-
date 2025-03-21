export default [
    {
    heading: 'Human Resource',
    subject:'Dashboard',
    action:'Read',
  },
  {
    title: 'Employment',
    icon: { icon: 'tabler-users' },
    subject:'Dashboard',
    action:'Read',
    children: [
      {
        title: 'Employee',
        subject:'Person',
        action:'Read',
      },
      {
        title: 'Attendance',
        subject:'User',
        action:'Read',
      },
      {
        title: 'Leave',
        subject: 'Dashboard',
        action: 'Read',
      },
      {
        title: 'Permit',
        subject: 'Dashboard',
        action: 'Read',
      },
    ]
  },
]