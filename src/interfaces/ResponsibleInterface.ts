interface IResponsible {
  name: string,
  cpf: string,
  email: string,
  password: string,
  country: string,
  phoneNumber: string,
  dependents: Array<string>,
  active: boolean,
  profileImg: string,
  longitude: string,
  latitude: string,
}

export default IResponsible;
