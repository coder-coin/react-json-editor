import { createStore } from 'zustand';
interface State {
  formFields: object;
}
interface Action {
  setFormField: (value: object) => void;
}
const editorStore = createStore<State & Action>((set) => {
  return {
    formFields: {},
    setFormField: (value: object) => set({ formFields: value }),
  };
});
export default editorStore;
