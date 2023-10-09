import { remove } from 'lodash-es';
import { Field, UpdateParams } from '../type';

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
/**
 * Update the properties of the target object
 * @param field
 * @param updateParams
 */
function updateProperties(field: Field, updateParams: UpdateParams) {
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
}

/**
 * Create a new field,return a new target obejct.
 * @param target
 * @param field
 * @returns
 */
export function createField(target: Field[], field: Field) {
  const newFields = [...target];
  const pathLength = field.path.length;
  let current: Field[] = newFields;
  // Top level
  if (pathLength === 1) {
    current.push(field);
    return newFields;
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
  return newFields;
}
/**
 * Update the specified field,return a new target object
 * @param target
 * @param field
 * @param updateParams key|value|comment
 * @returns
 */
export function updateField(
  target: Field[],
  path: string[],
  updateParams: UpdateParams,
) {
  const newFields = [...target];
  let current: Field[] = newFields;
  const len = path.length;
  // If paths only contains one
  if (len === 1) {
    const item = current.find((item) => item.id === path[0]);
    if (item) {
      updateProperties(item, updateParams);
    } else {
      // Unable find target , create a new target
      current.push({
        id: path[0],
        path,
        key: updateParams.key || '',
        type: updateParams.type || 'string',
      });
    }

    return newFields;
  }
  // Find field including the item which needs to be updated
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
  } else {
    // The item does not exist and create a new one
    current.push({
      id: path[len - 1],
      path,
      type: updateParams.type || 'string',
      key: updateParams.key || '',
      value: updateParams.value || '',
    });
  }
  return newFields;
}
/**
 * Remove a field from the targt and return a new target object.
 * @param target
 * @param path
 * @returns
 */
export function removeField(target: Field[], path: string[]) {
  const newFields = [...target];
  const len = path.length;
  let current = newFields;
  if (len === 1) {
    // Remove method will change the original array
    remove(current, (item: Field) => item.id === path[0]);
    return newFields;
  }
  for (let i = 0; i < len - 1; i++) {
    const upperField = current.find((item) => item.id === path[i]);
    if (upperField && upperField.children) {
      current = upperField.children;
    } else {
      throw new TypeError('Paths of field should includes valid ids.');
    }
  }
  remove(current, (item: Field) => item.id === path[len - 1]);
  return newFields;
}
/**
 * Get the field by specified path
 * @param target
 * @param path
 * @returns
 */
export function getField(target: Field[], path: string[]) {
  const pathLength = path.length;
  let current: Field[] = [...target];
  for (let i = 0; i < pathLength - 1; i++) {
    const upperField = current.find((item) => item.id === path[i]);
    if (upperField && upperField.children) {
      current = upperField.children;
    } else {
      throw new TypeError('Paths of field should includes valid ids.');
    }
  }
  const item = current.find((item) => item.id === path[pathLength - 1]);
  if (item) return item;
  throw new TypeError('Paths of field should includes valid ids.');
}

/**
 * A parser which generates a JSON string by a common field data
 * @param meta
 * @param needComma
 * @param tabIndent
 * @returns
 */
export function commonFieldParser(
  field: Field,
  needComma = true,
  tabIndent: string,
) {
  let value;
  if (field.type === 'string') {
    value = field.value ? `"${field.value}"` : `""`;
  } else {
    value = field.value;
  }
  value += needComma ? ',' : '';
  value += field.comment ? `  // ${field.comment}` : '';
  const key = field.key ? `"${field.key}":` : '';
  return tabIndent + key + value;
}
/**
 * Generate a JSON string by metadata array
 * @param metaArray
 * @param level
 * @returns
 */
export function fieldsParser(metaArray: Field[], level = 1) {
  return metaArray
    .reduce((acc, cur, index) => {
      const comment = cur.comment ? `//  ${cur.comment}` : '';
      if (cur.type === 'array') {
        const arrayStr = `${tabIndent.repeat(level)}${
          cur.key ? `"${cur.key}":` : ''
        }[  ${comment}\n${fieldsParser(
          cur.children!,
          level + 1,
        )}\n${tabIndent.repeat(level)}]${
          index !== metaArray.length - 1 ? ',' : ''
        }`;
        acc.push(arrayStr);
        return acc;
      }
      if (cur.type === 'object') {
        const arrayStr = `${tabIndent.repeat(level)}${
          cur.key ? `"${cur.key}":` : ''
        }{  ${comment}\n${fieldsParser(
          cur.children!,
          level + 1,
        )}\n${tabIndent.repeat(level)}}${
          index !== metaArray.length - 1 ? ',' : ''
        }`;
        acc.push(arrayStr);
        return acc;
      }
      acc.push(
        commonFieldParser(
          cur,
          index !== metaArray.length - 1,
          tabIndent.repeat(level),
        ),
      );
      return acc;
    }, [] as string[])
    .join('\n');
}
