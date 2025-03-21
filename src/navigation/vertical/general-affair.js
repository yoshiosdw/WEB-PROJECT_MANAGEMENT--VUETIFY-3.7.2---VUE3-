export default [
  {
    heading: 'General Affair',
    subject:'GA Ticket',
    action:'Manage',
  },
  {
    title: 'Ticket',
    icon: { icon: 'tabler:flag' },
    subject:'GA Ticket',
    action:'Manage',
    to: 'ticket-ga',
  },

  // {
  //   title: 'Asset',
  //   icon: { icon: 'tabler-archive' },
  //   subject:'Ticket',
  //   action:'Read',

  //   // to: 'assets',
  // },
  {
    title: 'Configuration',
    icon: { icon: 'tabler:category' },
    subject:'Ticket',
    action:'Read',
    children:[
      {
        title: 'Categories',
        subject:'Ticket',
        action:'Read',
        to: null,
      },
    ],
  },
]
