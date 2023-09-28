export interface DataMeta {
  id: string;
  key: string | null;
  type: string;
  value?: string | number | boolean;
  children?: DataMeta[];
  comment?: string;
}

export interface Field extends DataMeta {
  path: string[];
}

export interface UpdateParams {
  type?: string;
  key?: string;
  value?: string | number | boolean;
  comment?: string;
}
