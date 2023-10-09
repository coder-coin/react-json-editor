import { Input, Select, Switch, Tooltip } from 'antd';
import { DefaultOptionType } from 'antd/es/select';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSetState } from 'ahooks';
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
interface FieldState {
  type: string;
  name: string;
  value: string | number | boolean | null;
  comment: string;
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
  const { create, update, remove, getFields, getField, reset } =
    useJSON5Store();
  const [fieldState, setFieldState] = useSetState<FieldState>({
    type: 'string',
    name: '',
    value: '',
    comment: '',
  });
  const [collapse, setCollapse] = useState(true);
  const [childrenKeys, setChildrenKeys] = useState<string[]>([]);
  const currentPath = useRef<string[]>(prePath ? [...prePath, id] : []);

  // Handle name input
  const handleNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      console.log(currentPath.current);
      update(currentPath.current, {
        key: e.target.value,
      });
      setFieldState({ name: e.target.value });
    },
    [setFieldState, update],
  );
  // Handle value input
  const handleValueChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const input =
        fieldState.type === 'string' ? e.target.value : Number(e.target.value);
      update(currentPath.current, {
        value: input,
      });
      setFieldState({ value: input });
    },
    [fieldState.type, setFieldState, update],
  );
  // Handle type change
  const handleTyepChange = (type: string) => {
    update(currentPath.current, {
      type,
    });
    setFieldState({ type });
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
      setFieldState({ value: getInitialValue(type) });
      setChildrenKeys([]);
      setCollapse(true);
    }
  };
  // Handle comment change
  const handleCommentChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const input = e.target.value;
      update(currentPath.current, { comment: input });
      setFieldState({ comment: input });
    },
    [setFieldState, update],
  );
  // Value item rednerer
  const valueInputRenderer = useMemo(() => {
    const handleSwitchChange = (checked: boolean) => {
      update(currentPath.current, {
        value: checked,
      });
      setFieldState({ value: checked });
    };
    const { type, value } = fieldState;
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
  }, [fieldState, handleValueChange, setFieldState, update]);
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
    // Object keys must be non-empty
    if (index === undefined && !fieldState.name) {
      return;
    }
    addSibling(id);
  };
  // Control remove self
  const handleRemove = () => {
    console.log(currentPath.current);
    const fields = getFields();
    if (fields.length === 1 && fields[0].id === id) {
      setFieldState({ type: 'string', name: '', value: '', comment: '' });
      if (fieldState.type === 'array' || fieldState.type === 'object') {
        setChildrenKeys([]);
      }
      reset();
    }
    // remove current field from the store
    remove(currentPath.current);
    // remove UI
    removeSelf(id);
  };
  // Handle whether collapse
  const handleCollapse = () => {
    setCollapse((state) => !state);
  };
  // removeSelf method as each child element
  const handleRemoveChildren = (id: string) => {
    setChildrenKeys((state) => state.filter((item) => item !== id));
    remove([...currentPath.current, id]);
  };
  // Restore state after collapse was changed
  useEffect(() => {
    const { key, value, type, comment, children } = getField(
      currentPath.current,
    );
    setFieldState({
      name: key || '',
      type,
      value: value || '',
      comment: comment || '',
    });
    if (children && children?.length > 0) {
      setChildrenKeys(() => children.map((item) => item.id));
    }
  }, [getField, setFieldState]);
  return (
    <div className="space-y-2 rounded border p-2">
      <div className="flex items-center gap-4 ">
        {fieldState.type === 'object' || fieldState.type === 'array' ? (
          <Icon
            icon={chevronRight}
            fontSize={20}
            className={!collapse ? 'rotate-90' : ''}
            onClick={handleCollapse}
          />
        ) : undefined}
        <div className="flex flex-1 gap-4">
          <Select
            disabled={
              fieldState.type !== 'arrary' &&
              index === undefined &&
              fieldState.name.length === 0
            }
            value={fieldState.type}
            options={typeOptions}
            onChange={handleTyepChange}
            defaultValue="string"
            className="flex-1"
          />
          {fieldState.type !== 'arrary' && index === undefined && (
            <Input
              type="text"
              value={fieldState.name}
              placeholder="Name"
              status={fieldState.name === '' ? 'error' : undefined}
              onChange={handleNameChange}
              className="flex-1"
            />
          )}
          <div className="flex flex-1 items-center justify-center">
            {fieldState.type !== 'object' && fieldState.type !== 'array'
              ? valueInputRenderer
              : undefined}
          </div>
          <Input
            type="text"
            value={fieldState.comment}
            placeholder="Comment"
            className="flex-1"
            onChange={handleCommentChange}
          />
        </div>
        {(fieldState.type === 'array' || fieldState.type === 'object') &&
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
              index={fieldState.type === 'array' ? index : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
};
export default DynamicItem;
