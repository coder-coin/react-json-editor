import { useState } from 'react';
import DynamicItem from './DynamicItem';
import { getDefaultID } from '@/utils/string';
import useJSON5Store from '@/stores/json5.store';

const JSON5Editor: React.FC = () => {
  const create = useJSON5Store((state) => state.create);
  const [childrenKeys, setChildrenKeys] = useState<string[]>(() => {
    const defaultID = getDefaultID();
    create({
      id: defaultID,
      path: [defaultID],
      key: null,
      type: 'string',
    });
    return [defaultID];
  });

  const addChildrenKey = (key: string) => {
    const defaultID = getDefaultID();
    setChildrenKeys((state) => {
      const index = state.indexOf(key);
      const newState = [...state];
      newState.splice(index + 1, 0, defaultID);
      return newState;
    });
    create({
      id: defaultID,
      path: [defaultID],
      key: null,
      type: 'string',
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
          prePath={[]}
          addSibling={addChildrenKey}
          removeSelf={removeChildrenKey}
        />
      ))}
    </div>
  );
};
export default JSON5Editor;
