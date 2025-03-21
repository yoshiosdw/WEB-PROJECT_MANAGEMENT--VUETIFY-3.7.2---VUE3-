export default [
  {
    heading: 'Manufacture',
    subject:'Manufacture',
    action:'Read',
  },
  {
    title: 'Products',
    icon: { icon: 'tabler:packages' },
    subject:'Trial',
    action:'Read',
    children: [
      {
        title: 'Family Product',
        subject:'Manufacture',
        action:'Read',
      },
      {
        title: 'Product',
        subject:'Manufacture',
        action:'Read',
      },    
    ]
  },
  {
    title: 'Trial Report',
    icon: { icon: 'tabler:checkbox' },
    subject:'Trial',
    action:'Read',
    to: 'trial',
  },
  {
    title: 'SPK',
    icon: { icon: 'tabler:file-invoice' },
    subject: 'SPK',
    action: 'Read',
    children: [
      {
        title: 'Surat Perintah Kerja',
        subject: 'SPK',
        action: 'Read',
        to: 'spk'
      },
      {
        title: 'Inquiries',
        subject: 'SPK Inquiries',
        action: 'Read',
        to: 'spk-inquiries'
      },
      {
        title: 'Master Item',
        subject: 'SPK Master Item',
        action: 'Read',
        to: 'spk-master'
      },
    ]
  }
]
