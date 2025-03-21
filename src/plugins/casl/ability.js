import { Ability } from '@casl/ability'

export const initialAbility = [
  {
    action: 'Read',
    subject: 'Auth',
  },
]

//  Read ability from localStorage
// 👉 Handles auto fetching previous abilities if already logged in user
// ℹ️ You can update this if you store user abilities to more secure place
// ❗ Anyone can update localStorage so be careful and please update this
const stringifiedSinarjoUserAbilities = localStorage.getItem('sinarjoUserAbilities')
const existingAbility = stringifiedSinarjoUserAbilities ? JSON.parse(stringifiedSinarjoUserAbilities) : null
export default new Ability(existingAbility || initialAbility)
