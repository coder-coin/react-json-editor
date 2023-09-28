import { remove } from 'lodash-es';
import { DataMeta, Field, UpdateParams } from '../type';

const tabIndent = '  ';

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

function updateProperties(field: DataMeta, updateParams: UpdateParams) {
  const { key, value, comment, type } = updateParams;
  field.key = key || field.key;
  field.comment = comment || field.comment;
  if (type) {
    field.type = type;
    // Type changed
    if (type !== 'array' && type !== 'object') {
      field.value = getInitialValue(type);
    } else {
      delete field.value;
      field.children = [];
    }
  } else {
    field.value = value !== undefined ? value : field.value;
  }
  console.log(field);
}

/**
 * Create a new field,return a new target obejct.
 * @param target
 * @param field
 * @returns
 */
export function createField(target: DataMeta[], field: Field) {
  const pathLength = field.path.length;
  let current: DataMeta[] = [...target];
  // Top level
  if (pathLength === 1) {
    current.push(field);
    return current;
  }
  for (let i = 0; i < pathLength - 1; i++) {
    const upperField = current.find((item) => item.id === field.path[i]);
    if (upperField && upperField.children) {
      current = upperField.children;
    } else {
      throw new TypeError('Paths of field should includes valid ids.');
    }
  }
  current.push(field);
  return target;
}
/**
 * Update the specified field,return a new target object
 * @param target
 * @param field
 * @param updateParams key|value|comment
 * @returns
 */
export function updateField(
  target: DataMeta[],
  path: string[],
  updateParams: UpdateParams,
) {
  let current: DataMeta[] = [...target];
  const len = path.length;
  if (len === 1) {
    const item = current.find((item) => item.id === path[0]);
    if (item) {
      updateProperties(item, updateParams);
      return current;
    }
    throw new TypeError('Paths of field should includes valid ids.');
  }
  for (let i = 0; i < len - 1; i++) {
    const upperField = current.find((item) => item.id === path[i]);
    if (upperField && upperField.children) {
      current = upperField.children;
    } else {
      throw new TypeError('Paths of field should includes valid ids.');
    }
  }
  // Find need be updated item.
  const item = current.find((item) => item.id === path[len - 1]);
  if (item) {
    updateProperties(item, updateParams);
    return target;
  } else {
    throw new TypeError('Paths of field should includes valid ids.');
  }
}
/**
 * Remove a field from the targt and return a new target object.
 * @param target
 * @param path
 * @returns
 */
export function removeField(target: DataMeta[], path: string[]) {
  const len = path.length;
  let current = [...target];
  if (len === 1) {
    // Remove method will change the original array
    remove(current, (item: DataMeta) => item.id === path[0]);
    return current;
  }
  for (let i = 0; i < len - 1; i++) {
    const upperField = current.find((item) => item.id === path[i]);
    if (upperField && upperField.children) {
      current = upperField.children;
    } else {
      throw new TypeError('Paths of field should includes valid ids.');
    }
  }
  remove(current, (item: DataMeta) => item.id === path[len - 1]);
  return target;
}

/**
 * Generate a JSON string as a JSON'row
 * @param meta
 * @param needComma
 * @param tabIndent
 * @returns
 */
export function generatRowString(
  meta: DataMeta,
  needComma = true,
  tabIndent: string,
) {
  let value;
  if (meta.type === 'string') {
    value = meta.value ? `"${meta.value}"` : `""`;
  } else {
    value = meta.value;
  }
  value += needComma ? ',' : '';
  value += meta.comment ? `  // ${meta.comment}` : '';
  return meta.key
    ? `${tabIndent}"${meta.key}":${value}`
    : `${tabIndent}${value}`;
}
/**
 * Generate a JSON string by metadata array
 * @param metaArray
 * @param level
 * @returns
 */
export function generateJsonString(metaArray: DataMeta[], level = 1) {
  return metaArray
    .reduce((acc, cur, index) => {
      if (cur.type === 'array') {
        const arrayStr = `${tabIndent.repeat(level)}${
          cur.key ? `"${cur.key}":` : ''
        }[\n${generateJsonString(cur.children!, level + 1)}\n${tabIndent.repeat(
          level,
        )}]${index !== metaArray.length - 1 ? ',' : ''}`;
        acc.push(arrayStr);
        return acc;
      }
      if (cur.type === 'object') {
        const arrayStr = `${tabIndent.repeat(level)}"${
          cur.key
        }":{\n${generateJsonString(
          cur.children!,
          level + 1,
        )}\n${tabIndent.repeat(level)}}${
          index !== metaArray.length - 1 ? ',' : ''
        }`;
        acc.push(arrayStr);
        return acc;
      }
      acc.push(
        generatRowString(
          cur,
          index !== metaArray.length - 1,
          tabIndent.repeat(level),
        ),
      );
      return acc;
    }, [] as string[])
    .join('\n');
}
