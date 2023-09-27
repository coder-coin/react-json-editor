import { useState } from 'react';
import { ConfigProvider } from 'antd';
import ReactCodeMirror from '@uiw/react-codemirror';
import { vscodeDark } from '@uiw/codemirror-theme-vscode';
import { langs } from '@uiw/codemirror-extensions-langs';
import DynamicItem from './DynamicItem';
import { getDefaultID } from './utils/string';
import useEditorStore from './stores/editor.store';

function App() {
  const json = useEditorStore((state) => state.json);
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
    <>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: '#9333ea',
          },
        }}
      >
        <div className="flex">
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
          <ReactCodeMirror
            className="flex-1"
            value={JSON.stringify(json, null, 2)}
            basicSetup={{ crosshairCursor: false }}
            theme={vscodeDark}
            extensions={[langs.json()]}
            height="500px"
            readOnly
          />
        </div>
      </ConfigProvider>
    </>
  );
}

export default App;
