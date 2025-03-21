
export default [
  {
    heading: 'Quality Control Circle',
    subject:'Person',
    action:'Read',
  },
  {
    title: 'QCC',
    icon: { icon: 'tabler-users' },
    subject:'Person',
    action:'Read',
    children: [
      {
        title: 'Circle',
        subject:'Person',
        action:'Read',
        to:{ name: 'qcc-circle' },
      },
      {
        title: 'Submit QCC',
        subject:'Person',
        action:'Read',
        to:{ name: 'qcc' },
      },
      {
        title: 'Meeting',
        subject: 'Person',
        action: 'Read',
        children: [
          {
            title: 'Room Reservation',
            subject: 'Person',
            action: 'Read',
            to: { name: 'qcc-meeting-reservation' },
          },
          {
            title: 'Invitation',
            subject: 'Person',
            action: 'Read',
            to: { name: 'qcc-meeting-invitation' },
          },
          {
            title: 'Meeting',
            subject: 'Person',
            action: 'Read',
            to: { name: 'qcc-meeting' },
          },
        ],
      },
      {
        title: 'Configuration',
        subject: 'Person',
        action: 'Read',
        children: [
          {
            title: 'Circle Member Category',
            subject: 'Person',
            action: 'Read',
          },
        ],
      },
    ],
  },
]
