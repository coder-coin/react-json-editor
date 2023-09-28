import { useState } from 'react';
import DynamicItem from './DynamicItem';
import { getDefaultID } from '@/utils/string';

const JSONEditor: React.FC = () => {
  const [childrenKeys, setChildrenKeys] = useState<string[]>([getDefaultID()]);

  const addChildrenKey = (key: string) => {
    setChildrenKeys((state) => {
      const index = state.indexOf(key);
      const newState = [...state];
      newState.splice(index + 1, 0, getDefaultID());
      return newState;
    });
  };
  const removeChildrenKey = (key: string) => {
    if (childrenKeys.length === 1) return;
    setChildrenKeys((state) => state.filter((item) => item !== key));
  };
  return (
    <div className="flex-1 space-y-4 p-4">
      {childrenKeys.map((key) => (
        <DynamicItem
          key={key}
          id={key}
          addSibling={addChildrenKey}
          removeSelf={removeChildrenKey}
        />
      ))}
    </div>
  );
};
export default JSONEditor;
