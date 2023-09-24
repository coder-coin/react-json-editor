import { useEffect, useState } from 'react';
import { ConfigProvider, Form, message } from 'antd';
import ReactCodeMirror from '@uiw/react-codemirror';
import { vscodeDark } from '@uiw/codemirror-theme-vscode';
import { json } from '@codemirror/lang-json';
import DynamicItem from './DynamicItem';
import { NamePath } from 'antd/es/form/interface';
import { getDefaultID } from './utils/string';

function App() {
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const [jsonString, setJsonString] = useState('');
  const [fields, setFields] = useState<string[]>([getDefaultID()]);

  const add = (name: NamePath, id: string, preName?: NamePath) => {
    if (preName) {
      const father = form.getFieldValue(preName);
      console.log('father: ', father);
      if (
        Object.prototype.toString.call(father) === '[object Object]' &&
        Reflect.ownKeys(father).includes('')
      ) {
        return messageApi.warning('Name cannot be empty');
      }
    } else if (!preName) {
      const father = form.getFieldsValue();
      if (Reflect.ownKeys(father).includes('')) {
        return messageApi.warning('Name cannot be empty');
      }
    } else if (name === '') {
      messageApi.warning('Name cannot be empty');
      return;
    }
    setFields((state) => {
      const index = state.indexOf(id);
      const newState = [...state];
      newState.splice(index + 1, 0, getDefaultID());
      return newState;
    });
  };
  const remove = (name: string) => {
    setFields((state) => state.filter((field) => field !== name));
  };
  const handleFormChange = async () => {
    console.log(form.getFieldsValue());
    try {
      const result = await form.validateFields();
      if (result) {
        setJsonString(JSON.stringify(result, null, 2));
      }
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    setJsonString(JSON.stringify(form.getFieldsValue(), null, 2));
  }, [form]);
  return (
    <>
      {contextHolder}
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: '#9333ea',
          },
        }}
      >
        <div className="flex">
          <Form name="json-editor" form={form} className="sapce-y-4 flex-1 p-2">
            {fields.map((field) => (
              <DynamicItem
                key={field}
                id={field}
                add={add}
                remove={remove}
                onFormChange={handleFormChange}
              />
            ))}
          </Form>
          <ReactCodeMirror
            className="flex-1"
            value={jsonString}
            basicSetup={{ crosshairCursor: false }}
            theme={vscodeDark}
            extensions={[json()]}
            height="500px"
          />
        </div>
      </ConfigProvider>
    </>
  );
}

export default App;
