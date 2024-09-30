export interface SignupErrors {
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  general?:string
}

export interface LoginErrors{
  email?: string,
  password?: string,
  general?: string
}

export interface ResetErrors{
  password?: string,
  confirmPassword? : string
  general?: string
}

export interface CountryErrors{
  countryName? : string
}

export interface LanguageErrors{
  languageName? : string
  countries? : string
  general?: string
}

export interface CategoryErrors{
  categoryName? : string
}

export interface LessonErrors{
  title? : string
  description? : string
  content? : string
  languageName? : string
  categoryName? : string
  general? : string
}