import {
  set as ObjectSet,
  unset as ObjectUnset,
  get as ObjectGet,
} from 'lodash-es';
import { create } from 'zustand';

type BaseType = string | number | boolean | null | unknown[] | object;
interface State {
  json: object;
}
interface Action {
  addKey: (path: string, value: BaseType) => void;
  removeKeyFromJson: (path: string) => void;
  updateKey: (oldPath: string, newPath: string, value: BaseType) => void;
  updateValue: (path: string, value: BaseType) => void;
  getValue: (path: string) => BaseType;
  getJson: () => object;
}
const useEditorStore = create<State & Action>((set, get) => {
  return {
    json: {},
    // methods
    addKey: (path, value) => {
      const newJson = { ...get().json };
      // add new key with old value
      ObjectSet(newJson, path, value);
      set({ json: newJson });
    },
    removeKeyFromJson: (path: string) => {
      const newJson = { ...get().json };
      ObjectUnset(newJson, path);
      set({ json: newJson });
    },
    updateKey: (oldPath, newPath, value) => {
      const newJson = { ...get().json };
      // delete key
      ObjectUnset(newJson, oldPath);
      // add new key with old value
      ObjectSet(newJson, newPath, value);
      set({ json: newJson });
    },
    updateValue: (path, value) => {
      const newJson = { ...get().json };
      ObjectSet(newJson, path, value);
      set({ json: newJson });
    },
    getValue: (path) => {
      return ObjectGet(get().json, path);
    },
    getJson: () => get().json,
  };
});
export default useEditorStore;
