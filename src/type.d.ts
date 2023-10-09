export interface Field {
  id: string;
  path: string[];
  key: string | null;
  type: string;
  value?: string | number | boolean;
  children?: Field[];
  comment?: string;
}

export interface UpdateParams {
  type?: string;
  key?: string;
  value?: string | number | boolean;
  comment?: string;
}
