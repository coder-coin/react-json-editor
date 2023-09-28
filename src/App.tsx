import { useState } from 'react';
import useEditorStore from './stores/editor.store';
import { ConfigProvider, Switch } from 'antd';
import ReactCodeMirror from '@uiw/react-codemirror';
import { vscodeDark } from '@uiw/codemirror-theme-vscode';
import { langs } from '@uiw/codemirror-extensions-langs';
import JSONEditor from './Editor_json';
import JSON5Editor from './Editor_json5';

function App() {
  const json = useEditorStore((state) => state.json);
  const [mode, setMode] = useState('json');
  const handleModeChange = (value: boolean) => {
    setMode(value ? 'json5' : 'json');
  };
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#9333ea',
        },
      }}
    >
      <div className="flex h-full flex-col">
        <div className="container mx-auto flex h-20 items-center gap-4 px-4">
          <span className="text-lg font-semibold">React JSON Editor</span>
          <Switch
            checkedChildren="json5"
            unCheckedChildren="json"
            defaultChecked={false}
            onChange={handleModeChange}
          />
        </div>
        <div className="flec-col container mx-auto flex flex-1 overflow-auto p-4">
          <div className="flex w-full rounded border">
            <div className="h-full flex-1 overflow-auto">
              {mode === 'json' ? <JSONEditor /> : <JSON5Editor />}
            </div>
            <div className="editor flex-1">
              <ReactCodeMirror
                value={JSON.stringify(json, null, 2)}
                basicSetup={{ crosshairCursor: false }}
                theme={vscodeDark}
                extensions={[langs.json()]}
                readOnly
              />
            </div>
          </div>
        </div>
      </div>
    </ConfigProvider>
  );
}

export default App;
