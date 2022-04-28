interface IDependent {
  name: string,
  cpf: string,
  email: string,
  password: string,
  country: string,
  phoneNumber: string,
  responsible: Array<string>,
  active: boolean,
  profileImg: string,
  longitude: string,
  latitude: string,
}

export default IDependent;
