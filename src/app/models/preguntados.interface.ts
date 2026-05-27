export interface ApiResponse {
  info: Info;
  results: Character[];
}

export interface Info {
  count: number;
  pages: number;
  next_page: string | null;
  prev_page: string | null;
}

export interface Character {
  id: number;
  name: string;
  img: string;
  alias: string[];
  species: string[];
  gender: string;
  age: number | string;
  height: string;
  relatives: Relative[];
  birthplace: string;
  residence: string;
  status: string;
  occupation: string;
  groups: any[];
  roles: string[];
  episodes: string[];
}

export interface Relative {
  family: string;
  members: string[];
}
