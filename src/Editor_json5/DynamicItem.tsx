import { Input, Select, Switch, Tooltip } from 'antd';
import { DefaultOptionType } from 'antd/es/select';
import { useCallback, useMemo, useRef, useState } from 'react';
import { Icon } from '@iconify/react';
import plusIcon from '@iconify/icons-tabler/plus';
import trashX from '@iconify/icons-tabler/trash-x';
import squarePlus2 from '@iconify/icons-tabler/square-plus-2';
import chevronRight from '@iconify/icons-tabler/chevron-right';
import { getDefaultID } from '@/utils/string';
import useJSON5Store from '@/stores/json5.store';
interface Props {
  id: string;
  addSibling: (id: string) => void;
  removeSelf: (key: string) => void;
  prePath: string[];
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
    default:
      return '';
  }
};

const DynamicItem: React.FC<Props> = ({
  id,
  addSibling,
  removeSelf,
  prePath,
  index,
}) => {
  const { create, update, remove, getFields } = useJSON5Store();

  const [name, setName] = useState<string>('');
  const [type, setType] = useState('string');
  const [value, setValue] = useState<string | number | boolean | null>('');
  const [collapse, setCollapse] = useState(true);
  const [childrenKeys, setChildrenKeys] = useState<string[]>([]);
  const currentPath = useRef<string[]>(prePath ? [...prePath, id] : []);

  // Handle name input
  const handleNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      console.log(e.target.value);
      update(currentPath.current, {
        key: e.target.value,
      });
      setName(e.target.value);
    },
    [update],
  );
  // Handle value input
  const handleValueChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const input = type === 'string' ? e.target.value : Number(e.target.value);
      update(currentPath.current, {
        value: input,
      });
      setValue(input);
    },
    [type, update],
  );
  // Handle type change
  const handleTyepChange = (type: string) => {
    console.log(currentPath.current);
    update(currentPath.current, {
      type,
    });
    setType(type);

    if (type === 'object' || type === 'array') {
      // Add first child
      const defaultID = getDefaultID();
      create({
        id: defaultID,
        key: null,
        path: [...currentPath.current, defaultID],
        type: 'string',
      });
      setChildrenKeys([defaultID]);
      setCollapse(false);
    } else {
      setValue(getInitialValue(type));
      setChildrenKeys([]);
      setCollapse(true);
    }
  };
  // Handle comment change
  const handleCommentChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      update(currentPath.current, { comment: e.target.value });
    },
    [update],
  );
  // Value item rednerer
  const valueInputRenderer = useMemo(() => {
    const handleSwitchChange = (checked: boolean) => {
      update(currentPath.current, {
        value: checked,
      });
      setValue(checked);
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
  }, [handleValueChange, type, update, value]);
  // Add new children
  const handleAddChildren = (key?: string) => {
    const defaultID = getDefaultID();
    if (key) {
      setChildrenKeys((state) => {
        const index = state.indexOf(key);
        const newState = [...state];
        newState.splice(index + 1, 0, defaultID);
        return newState;
      });
    } else {
      setChildrenKeys((state) => [...state, defaultID]);
    }
    create({
      id: defaultID,
      key: null,
      type: 'string',
      path: [...currentPath.current, defaultID],
    });
  };
  // Control add sibling
  const handleSiblingAdd = (id: string) => {
    addSibling(id);
  };
  // Control remove self
  const handleRemove = () => {
    if (getFields().length === 1) {
      setName('');
      setValue('');
    }
    remove(currentPath.current);
    removeSelf(id);
  };
  const handleCollapse = () => {
    setCollapse((state) => !state);
  };
  const handleRemoveChildren = (id: string) => {
    setChildrenKeys((state) => state.filter((item) => item !== id));
    remove([...currentPath.current, id]);
  };
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
          <Select
            disabled={
              type !== 'arrary' && index === undefined && name.length === 0
            }
            options={typeOptions}
            onChange={handleTyepChange}
            defaultValue="string"
            className="flex-1"
          />
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
          <div className="flex flex-1 items-center justify-center">
            {type !== 'object' && type !== 'array'
              ? valueInputRenderer
              : undefined}
          </div>
          <Input
            placeholder="Comment"
            className="flex-1"
            onChange={handleCommentChange}
          />
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
              prePath={currentPath.current}
              index={type === 'array' ? index : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
};
export default DynamicItem;
