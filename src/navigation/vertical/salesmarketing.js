export default [
  {
    heading: 'Sales & Marketing',
    subject:'Return',
    action:'Read',
  },
  {
    title: 'Customers',
    icon: { icon: 'tabler-users' },
    subject:'Return',
    action:'Read',
    children: [
      {
        title: 'Area',
        subject:'Return',
        action:'Read',
      },
      {
        title: 'Customer',
        subject:'Return',
        action:'Read',
      },
    ]
  },
  {
    title: 'SAT',
    icon: { icon: 'tabler:subtask' },
    subject:'SAT',
    action:'Read',
    children: [
      {
        title: 'Dashboard',
        to: { name: 'sat-dashboard'},
        subject:'SAT',
        action:'Read',
      },
      {
        title: 'Job Order',
        to: { name: 'sat'},
        subject:'SAT',
        action:'Read',
      },
      {
        title: 'Inquiries',
        to: { name: 'sat-history'},
        subject:'SAT',
        action:'Read',
      },
    ]
  },
  {
    title: 'Retur',
    icon: { icon: 'tabler:arrow-back-up' },
    to: { name: 'retur'},
    subject:'Return',
    action:'Read',
    children: [
      {
        title: 'Dashboard',
        subject: 'Return',
        action: 'Read',
        to: { name: 'retur-home' }
      },
      {
        title: 'Retur Order',
        subject: 'Return',
        action: 'Read',
        to: { name: 'retur' }
      },
      {
        title: 'Configuration',
        icon: { icon: 'tabler-settings' },
        subject:'Return',
        action:'Read',
        children: [
          {
            title: 'Retur Category',
            subject:'Config',
            action:'Read',
            to: { name: 'retur-category'}
          },
          {
            title: 'Retur Sub Category',
            subject:'Config',
            action:'Read',
            to: { name: 'retur-subCategory'}
          },
          {
            title: 'Handling Type',
            subject:'Config',
            action:'Read',
            to: { name: 'retur-handling'}
          },
        ]
      },
    ]
  },
  {
    title: 'SFA',
    icon: { icon: 'tabler:shopping-cart' },
    subject:'Return',
    action:'Read',
    children: [
      {
        title: 'Schedule',
        subject:'Return',
        action:'Read',
      },
      {
        title: 'Journey',
        subject:'Return',
        action:'Read',
      },
    ]
  },
]
