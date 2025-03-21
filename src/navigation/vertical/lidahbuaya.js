export default [

  {
    heading: 'Configuration',
    subject:'Person',
    action:'Manage',
  },
  {
    title: 'Employee',
    icon:{ icon: 'tabler-users-group'},
    to: 'employee',
    subject: 'Person',
    action: 'Read'
  },
  {
    title: 'Authorization',
    icon: { icon: 'tabler:lock' },
    subject:'Person',
    action:'Read',
    children: [
      {
        title: 'Person',
        to:'person',
        subject:'Person',
        action:'Read',
      },
      {
        title: 'User',
        subject:'User',
        action:'Read',
        to: 'user'
      },
      {
        title: 'Roles',
        to: 'roles',
        subject: 'Roles',
        action: 'Read',
      },
    ]
  },
  {
    title: 'Companies',
    icon: { icon: 'tabler:building' },
    subject:'Auth',
    action:'Manage',
    children: [
      {
        title: 'Company',
        subject:'Organization',
        action:'Read',
        to: {name: 'organization'}
      },
      {
        title: 'Jobs',
        subject:'Organization',
        action:'Read',
        to: {name: 'job-functions'}
      },
    ]
  },
  {
    title: 'Location',
    icon: { icon: 'tabler-map-2' },
    subject:'Person',
    action:'Read',
    children: [
      {
        title: 'Lokasi',
        subject: 'Organization',
        action: 'Read',
        to: { name: 'location' }
      },
      {
        title: 'Meeting Room',
        subject: 'Organization',
        action: 'Read',
        to: { name: 'location-meeting-room' }
      }
    ]
  },
]
