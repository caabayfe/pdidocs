/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  const {
    selectionProps: {
      selectedRowIds
    }
  } = api.data.list;
  const {
    attributeCheckedState
  } = api.state;

  const attributeKeys = Object.keys(attributeCheckedState);
  if (attributeKeys.some(key => attributeCheckedState[key]) || selectedRowIds.length == 1)
    return '';

  // Show helper text only when multiple records are selected from list, 
  // and atleast 1 of them has a record-level comment
  let commentsFound = 0;
  let cache = api.data.cert.attrStatusAndCommentCache;
  for (const rowId in cache) {
    if (selectedRowIds.includes(rowId) && cache[rowId].recordLevelComment)
      commentsFound++;
  }

  if (selectedRowIds.length > 1 && commentsFound > 0)
    return helpers.translateSync("Comment exists for 1 or more records");
  
  return '';
}
