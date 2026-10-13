function include(/* {
    imports
}, api = {}, helpers = {} */) {
  let nodeCounter = 0,
    currentNode = null,
    nodeStack = [],
    skeletonObject = {};

  const PARSER_CONSTANTS = {
    symbols: ['/', '+', '>', '^', '\n'],
    orderOfWords: ['field', 'operator', 'conditionValue', 'comparisonType'],
    has_children: '=HAS_CHILDREN',
    children: 'children',
    field: 'field',
    operator: 'operator',
    operator_value: 'internal_value',
    condition_value: 'conditionValue',
    comparison_type: 'comparisonType',
    signal: {
      SIBLING_SEPERATOR: '+',
      ELEMENT_SEPERATOR: '/',
      STEP_INTO: '>',
      STEP_OUT: '^',
      EOS: '\n',
    },
    notations: ['NEW_QUERY', 'OR', 'AND', 'IN_WHICH', 'THAT_HAS'],
  };

  function _encodeWord(word) {
    if (typeof word == 'string') return encodeURIComponent(word);
    return encodeURIComponent(JSON.stringify(word));
  }

  function _encodeJSON(jsonQuery, startIndex, encodedString) {
    if (jsonQuery.length == startIndex) {
      return encodedString;
    }
    if (startIndex > 0)
      encodedString += PARSER_CONSTANTS.signal.SIBLING_SEPERATOR;
    let fieldValues = [];
    const queryBlock = jsonQuery[startIndex];
    PARSER_CONSTANTS.orderOfWords.forEach((field, index) => {
      var _value;
      switch (field) {
        case PARSER_CONSTANTS.operator:
          _value =
            queryBlock[field][PARSER_CONSTANTS.operator_value] ||
            queryBlock[field];
          break;
        case PARSER_CONSTANTS.condition_value:

        default:
          _value = queryBlock[field];
      }
      fieldValues.push(_encodeWord(_value));
    });
    encodedString += fieldValues.join(
      PARSER_CONSTANTS.signal.ELEMENT_SEPERATOR
    );
    if (queryBlock.children && Array.isArray(queryBlock.children)) {
      const _children = _encodeJSON(queryBlock.children, 0, '');
      if (_children)
        encodedString =
          encodedString +
          PARSER_CONSTANTS.signal.STEP_INTO +
          _children +
          PARSER_CONSTANTS.signal.STEP_OUT;
    }
    return _encodeJSON(jsonQuery, ++startIndex, encodedString);
  }

  function _checkIfEmptyComparisonModel(query) {
    try {
      if (
        query &&
        Array.isArray(query) &&
        query.length == 1 &&
        !query[0].field
      )
        return true;
      return false;
    } catch (e) {
      return false;
    }
  }

  /**
   * Converts VA Comparison Model to VA Encoded String
   * @param {*} jsonQuery
   * @returns String
   */
  function encodeVAURIQuery(jsonQuery) {
    if (!jsonQuery || typeof jsonQuery != 'object') return null;
    if (jsonQuery.length == 0) return null;
    if(_checkIfEmptyComparisonModel(jsonQuery)) return null;
    const encodedString = _encodeJSON(jsonQuery, 0, '');
    return encodedString;
  }

  return {
    encodeVAURIQuery: encodeVAURIQuery,
  };
}
