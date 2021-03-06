import { isObject } from '../../../utils/inspect';
import sanitizeRow from './sanitize-row';
import stringifyObjectValues from './stringify-object-values'; // Stringifies the values of a record, ignoring any special top level field keys
// TODO: Add option to stringify `scopedSlot` items

var stringifyRecordValues = function stringifyRecordValues(row, ignoreFields, includeFields, fieldsObj) {
  return isObject(row) ? stringifyObjectValues(sanitizeRow(row, ignoreFields, includeFields, fieldsObj)) :
  /* istanbul ignore next */
  '';
};

export default stringifyRecordValues;