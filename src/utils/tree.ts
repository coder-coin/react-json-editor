import { isObject, isString, isNumber } from 'lodash-es';

type JSONValue = string | number | boolean | null | JSONObject | JSONArray;

interface JSONObject {
  [x: string]: JSONValue;
}
interface JSONArray extends Array<JSONValue> {}
/**
 * 根据路径更新JSON对象的值
 * @param tree
 * @param path
 * @param value
 * @returns
 */
export function update(
  tree: JSONObject | JSONArray,
  path: string | (string | number)[],
  value: string | number | boolean,
) {
  // 统一将路径转为数组
  const paths = Array.isArray(path) ? path : [path];
  let current = tree;
  for (let i = 0; i < paths.length - 1; i++) {
    const key: string | number = paths[i];
    // 检查当前对象是不是数组
    if (Array.isArray(current) && isNumber(key)) {
      // 如果当前索引超出了数组长度，则根据后一个路径新建一个空对象或者数组
      if (key >= current.length) {
        current[key] = isNumber(paths[i + 1]) ? [] : {};
      }
      current = current[key] as JSONArray | JSONObject;
    } else {
      // 当前路径不是数组索引
      if (
        isObject(current) &&
        isString(key) &&
        !Reflect.ownKeys(current).includes(key)
      ) {
        (current as JSONObject)[key] = isNumber(paths[i + 1]) ? [] : {};
      }
      current = (current as JSONObject)[key] as JSONObject | JSONArray;
    }
  }

  if (isObject(current)) {
    (current as JSONObject)[paths[paths.length - 1] as string] = value;
  } else {
    (current as JSONArray)[paths[paths.length - 1] as number] = value;
  }
  return tree;
}
