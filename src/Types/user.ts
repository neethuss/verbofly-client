
export interface User{
  username : string;
  email : string;
  password : string;
  isBlocked : boolean;
  country : Country
  nativeLanguage : Language
  knownLanguages : Language[]
  languagesToLearn : Language[]
  profilePhoto : string
  bio : string
  sentRequests: User[]; 
  receivedRequests: User[]; 
  connections: User[]; 
  isSubscribed :boolean;
  expirationDate : Date
}

export interface Country{
  countryName : string,
  isBlocked : boolean
}

export interface Language{
  languageName : string;
  countries :  Country[];
  isBlocked : boolean
}