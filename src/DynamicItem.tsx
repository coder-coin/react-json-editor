import { Input, Select, Switch, Tooltip } from 'antd';
import { DefaultOptionType } from 'antd/es/select';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Icon } from '@iconify/react';
import plusIcon from '@iconify/icons-tabler/plus';
import trashX from '@iconify/icons-tabler/trash-x';
import squarePlus2 from '@iconify/icons-tabler/square-plus-2';
import chevronRight from '@iconify/icons-tabler/chevron-right';
import { getDefaultID } from './utils/string';
import useEditorStore from './stores/editor.store';
interface Props {
  id: string;
  addSibling: (id: string) => void;
  removeSelf: (key: string) => void;
  preNamePath?: string;
  index?: number;
}

const typeOptions: DefaultOptionType[] = [
  {
    label: 'string',
    value: 'string',
  },
  {
    label: 'number',
    value: 'number',
  },
  {
    label: 'boolean',
    value: 'boolean',
  },
  {
    label: 'array',
    value: 'array',
  },
  {
    label: 'object',
    value: 'object',
  },
];

const getInitialValue = (type: string) => {
  switch (type) {
    case 'string':
      return '';
    case 'number':
      return 0;
    case 'boolean':
      return false;
    case 'object':
      return {};
    case 'array':
      return [];
    default:
      return null;
  }
};

const DynamicItem: React.FC<Props> = ({
  id,
  addSibling,
  removeSelf,
  preNamePath,
  index,
}) => {
  const { getJson, updateValue, updateKey, removeKeyFromJson, getValue } =
    useEditorStore();

  const [name, setName] = useState<string>('');
  const [type, setType] = useState('string');
  const [value, setValue] = useState<string | number | boolean | null>('');
  const [collapse, setCollapse] = useState(true);
  const [childrenKeys, setChildrenKeys] = useState<string[]>([]);
  const currentPath = useRef<string>(preNamePath || '');

  // Handle name input
  const handleNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newPath = preNamePath
        ? `${preNamePath}.${e.target.value}`
        : e.target.value;
      // if change the upper level keys
      updateKey(
        currentPath.current,
        newPath,
        getValue(currentPath.current) || '',
      );
      // Update current path
      currentPath.current = newPath;
      setName(e.target.value);
    },
    [getValue, preNamePath, updateKey],
  );
  // Handle value input
  const handleValueChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const input = type === 'string' ? e.target.value : Number(e.target.value);
      updateValue(currentPath.current, input);
      setValue(input);
    },
    [type, updateValue],
  );
  // Handle type change
  const handleTyepChange = (value: string) => {
    updateValue(currentPath.current, getInitialValue(value));
    setType(value);
    // Add first child
    if (value === 'object' || value === 'array') {
      setChildrenKeys([getDefaultID()]);
      setCollapse(false);
    } else {
      setChildrenKeys([]);
      setCollapse(true);
    }
  };
  // Value item rednerer
  const valueInputRenderer = useMemo(() => {
    const handleSwitchChange = (value: boolean) => {
      updateValue(currentPath.current, value);
      setValue(value);
    };
    if (type === 'string' || type === 'number') {
      return (
        <Input
          value={value as string | number}
          type={type === 'string' ? 'text' : 'number'}
          placeholder="Value"
          onChange={handleValueChange}
          defaultValue={type === 'string' ? '' : 0}
        />
      );
    } else if (type === 'boolean') {
      return (
        <Switch checked={value as boolean} onChange={handleSwitchChange} />
      );
    }
    return <Input disabled />;
  }, [handleValueChange, type, updateValue, value]);
  // Add new children
  const handleAddChildren = (key?: string) => {
    if (key) {
      setChildrenKeys((state) => {
        const index = state.indexOf(key);
        const newState = [...state];
        newState.splice(index + 1, 0, getDefaultID());
        return newState;
      });
    } else {
      setChildrenKeys((state) => [...state, getDefaultID()]);
    }
  };
  // Control add sibling
  const handleSiblingAdd = (id: string) => {
    addSibling(id);
  };
  // Control remove self
  const handleRemove = () => {
    if (Reflect.ownKeys(getJson()).length === 1) {
      setName('');
      setValue('');
    }
    removeKeyFromJson(currentPath.current);
    removeSelf(id);
  };
  const handleCollapse = () => {
    setCollapse((state) => !state);
  };
  const handleRemoveChildren = (id: string) => {
    setChildrenKeys((state) => state.filter((item) => item !== id));
  };
  // Update path when current component'name be changed
  useEffect(() => {
    currentPath.current = preNamePath ? `${preNamePath}.${name}` : name;
  }, [name, preNamePath]);
  // When current component is an item of array,update path
  useEffect(() => {
    if (index !== undefined) {
      currentPath.current = preNamePath
        ? `${preNamePath}[${index}]`
        : `${index}`;
    }
  }, [index, preNamePath]);
  return (
    <div className="space-y-2 rounded border p-2">
      <div className="flex items-center gap-4 ">
        {type === 'object' || type === 'array' ? (
          <Icon
            icon={chevronRight}
            fontSize={20}
            className={!collapse ? 'rotate-90' : ''}
            onClick={handleCollapse}
          />
        ) : undefined}
        {}
        <div className="flex flex-1 gap-4">
          {type !== 'arrary' && index === undefined && (
            <Input
              type="text"
              value={name}
              placeholder="Name"
              status={name === '' ? 'error' : undefined}
              onChange={handleNameChange}
              className="flex-1"
            />
          )}
          <Select
            disabled={
              type !== 'arrary' && index === undefined && name.length === 0
            }
            options={typeOptions}
            onChange={handleTyepChange}
            defaultValue="string"
            className="flex-1"
          />
          <div className="flex flex-1 items-center justify-center">
            {type !== 'object' && type !== 'array'
              ? valueInputRenderer
              : undefined}
          </div>
        </div>
        {(type === 'array' || type === 'object') &&
        childrenKeys.length === 0 ? (
          <Tooltip title="Add child node">
            <span
              className="group cursor-pointer rounded-full border p-1 text-blue-600"
              onClick={() => handleAddChildren(childrenKeys[0])}
            >
              <Icon
                icon={squarePlus2}
                fontSize={20}
                className="group-hover:scale-90"
              />
            </span>
          </Tooltip>
        ) : undefined}
        <Tooltip title="Add sibling node">
          <span
            className="group cursor-pointer rounded-full border p-1 text-blue-600"
            onClick={() => handleSiblingAdd(id)}
          >
            <Icon
              icon={plusIcon}
              fontSize={20}
              className="group-hover:scale-90"
            />
          </span>
        </Tooltip>
        <span
          className="group cursor-pointer rounded-full border p-1 text-red-500"
          onClick={handleRemove}
        >
          <Icon icon={trashX} fontSize={20} className="group-hover:scale-90" />
        </span>
      </div>
      {!collapse && (
        <div className="space-y-2 border-t py-2 pl-10 pr-2">
          {childrenKeys.map((key, index) => (
            <DynamicItem
              key={key}
              id={key}
              addSibling={handleAddChildren}
              removeSelf={handleRemoveChildren}
              preNamePath={currentPath.current}
              index={type === 'array' ? index : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
};
export default DynamicItem;
