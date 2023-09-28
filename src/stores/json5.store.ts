import { DataMeta, Field, UpdateParams } from '@/type';
import { createField, removeField, updateField } from '@/utils/json5';
import { create } from 'zustand';
interface State {
  fields: DataMeta[];
}
interface Action {
  create: (field: Field) => void;
  update: (path: string[], updateParams: UpdateParams) => void;
  remove: (path: string[]) => void;
  getFields: () => DataMeta[];
}

const useJSON5Store = create<State & Action>((set, get) => ({
  fields: [],
  create: (field) => {
    const newField = createField(get().fields, field);
    set({ fields: newField });
  },
  update: (path, updateParams) => {
    const newField = updateField(get().fields, path, updateParams);
    set({ fields: newField });
  },
  remove: (path) => {
    const newField = removeField(get().fields, path);
    set({ fields: newField });
  },
  getFields: () => get().fields,
}));

export default useJSON5Store;
