import { Button, Form, Input, Select, Switch, Tooltip } from 'antd';
import { DefaultOptionType } from 'antd/es/select';
import { ChangeEvent, useCallback, useMemo, useState } from 'react';
import { Icon } from '@iconify/react';
import plusIcon from '@iconify/icons-tabler/plus';
import trashX from '@iconify/icons-tabler/trash-x';
import { NamePath } from 'antd/es/form/interface';
interface Props {
  id: string;
  add: (name: NamePath, id: string, preName?: NamePath) => void;
  remove: (name: string) => void;
  onFormChange: () => void;
  preNamePath?: NamePath;
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
    label: 'obejct',
    value: 'obejct',
  },
];

const getInitialValue = (type: string) => {
  switch (type) {
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
  add,
  onFormChange,
  remove,
  preNamePath,
}) => {
  const form = Form.useFormInstance();

  const [name, setName] = useState<NamePath>(
    preNamePath ? [...preNamePath, ''] : '',
  );
  const [type, settype] = useState('string');

  const handleNameChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      // Get value of the name
      const value = form.getFieldValue(name);
      if (typeof name === 'string') {
        form.setFieldValue(e.target.value, value);
        setName(e.target.value);
      } else if (Array.isArray(name)) {
        setName((state: string[]) => {
          const copyName = [...state];
          copyName.splice(copyName.length - 1, 1, e.target.value);
          form.setFieldValue(copyName, value);
          return copyName;
        });
      }
      onFormChange();
    },
    [form, name, onFormChange],
  );
  const handleTyepChange = (value: string) => {
    let initialValue;
    if (value === 'number') {
      initialValue = 0;
    } else if (value === 'boolean') {
      initialValue = false;
    } else {
      initialValue = '';
    }
    settype(value);
    form.setFieldValue(name, initialValue);
    onFormChange();
  };
  const valueInputRenderer = useMemo(() => {
    const handleValueChange = () => {
      onFormChange();
    };
    if (type === 'string' || type === 'number') {
      return (
        <Input
          type={type === 'string' ? 'text' : 'number'}
          placeholder="Value"
          onChange={handleValueChange}
        />
      );
    } else if (type === 'boolean') {
      return <Switch onChange={handleValueChange} />;
    }
    return <Input disabled className="flex-1" />;
  }, [onFormChange, type]);
  const handleAdd = () => {
    add(name, id, preNamePath);
    onFormChange();
  };
  const handleRemove = async () => {
    try {
      const result = await form?.validateFields();
      if (Reflect.ownKeys(result).length === 1) return;
      remove(id);
      onFormChange();
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div className="flex gap-4 rounded border p-2">
      <Input
        placeholder="Name"
        status={name === '' ? 'error' : undefined}
        onChange={handleNameChange}
        className="flex-1"
      />
      <Select
        options={typeOptions}
        onChange={handleTyepChange}
        defaultValue="string"
        className="flex-1"
      />
      <Form.Item
        name={name}
        normalize={(value: string | boolean) =>
          type === 'number' ? Number(value) : value
        }
        valuePropName={type === 'boolean' ? 'checked' : 'value'}
        initialValue={getInitialValue(type)}
        className={`flex-1 ${type === 'boolean' ? 'flex justify-center' : ''}`}
      >
        {valueInputRenderer}
      </Form.Item>
      <Tooltip
        title={
          type === 'array' || type === 'object'
            ? 'Add child node'
            : 'Add sibling node'
        }
      >
        <Button type="primary" onClick={handleAdd}>
          <Icon icon={plusIcon} fontSize={20} />
        </Button>
      </Tooltip>

      <Button danger onClick={handleRemove}>
        <Icon icon={trashX} fontSize={20} />
      </Button>
    </div>
  );
};
export default DynamicItem;
