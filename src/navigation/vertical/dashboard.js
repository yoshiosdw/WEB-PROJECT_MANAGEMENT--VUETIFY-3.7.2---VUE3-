export default [
  {
    title: 'Dashboards',
    icon: { icon: 'tabler-smart-home' },
    subject:'Dashboard',
    action:'Read',
    children: [
      {
        title: 'Analytics',
        to: 'dashboards-analytics',
        subject:'Dashboard',
        action:'Read',
      },
      {
        title: 'eCommerce',
        to: 'dashboards-ecommerce',
        subject: 'Dashboard',
        action: 'Read',
      },
      {
        title: 'CRM',
        to: 'dashboards-crm',
      },
    ],
    badgeContent: '2',
    badgeClass: 'bg-light-primary text-primary',
  },
]
