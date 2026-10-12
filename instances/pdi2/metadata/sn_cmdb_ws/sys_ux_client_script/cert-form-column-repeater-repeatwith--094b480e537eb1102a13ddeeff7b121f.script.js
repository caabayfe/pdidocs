/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  const EMPTY_VALUE_LABEL = helpers.translateSync('(empty)');
  let fieldData = [];
  const fieldElements = api?.data?.glide_form_1?.nowRecordFormBlob?.fieldElements;
  const {
    selectionProps: {
      allRowsSelected,
      exceptedRowIds,
      selectedRowIds
    }
  } = api.data.list;
  const {
    attrStatusAndCommentCache,
    rowCache
  } = api.data.cert;
  if (!fieldElements || !rowCache || !attrStatusAndCommentCache)
    return fieldData;

  const rowSet = new Set(selectedRowIds);
  const exceptedRows = new Set(exceptedRowIds);
  fieldElements.forEach((field) => {
    const {
      name,
      dictionary: {
        label
      }
    } = field;
    let inputValues = new Set();
    let comments = [];
    let highlightConfigs = [];
    let statusCounts = {
      pending: 0,
      certified: 0,
      failed: 0
    };
    let payload = {
      name,
      label
    };

    Object.keys(rowCache).forEach((row) => {
      if (rowSet.has(row) || (allRowsSelected && !exceptedRows.has(row))) {
        let cell = rowCache[row][name];
        let label = cell.label || cell.value;
        if (cell && cell.type && (cell.type == 'number' || cell.type == 'boolean'))
          label = cell.metadata.internalValue;
        inputValues.add(label || EMPTY_VALUE_LABEL);
      }
    });
    payload.inputValues = [...inputValues];
    
    Object.keys(attrStatusAndCommentCache).forEach((document) => {
      if (rowSet.has(document) || (allRowsSelected && !exceptedRows.has(document))) {
        let statusVal = attrStatusAndCommentCache[document]["attributes"][name].status;
        statusCounts[statusVal] = statusCounts[statusVal] + 1;
        let comment = attrStatusAndCommentCache[document]["attributes"][name].comment;
        if (comment)
            comments.push(comment);
      }
    });
    if (selectedRowIds.length > 1 && comments.length > 0)
        payload.comments = [helpers.translateSync('This field has comments from 1 or more selected records.')];
    else
        payload.comments = comments;
    
    if (statusCounts.pending > 0 && (statusCounts.certified + statusCounts.failed > 0)) {
      highlightConfigs.push({
        label: helpers.translateSync('In progress'),
        icon: 'circle-semi-check-outline',
        variant: 'secondary',
        color: 'yellow'
      });
    }

    if (statusCounts.pending == 0 && statusCounts.certified > 0) {
      highlightConfigs.push({
        label: statusCounts.certified == selectedRowIds.length 
          ? helpers.translateSync('Certified') 
          : helpers.translateSync('Certified: {0}', statusCounts.certified),
        icon: 'check-outline',
        variant: 'tertiary',
        color: 'positive'
      });
    }
    if (statusCounts.pending == 0 && statusCounts.failed > 0) {
      highlightConfigs.push({
        label: statusCounts.failed == selectedRowIds.length
          ? helpers.translateSync('Failed')
          : helpers.translateSync('Failed: {0}', statusCounts.failed),
        icon: 'close-outline',
        variant: 'tertiary',
        color: 'critical'
      });
    }
    payload.highlightConfigs = highlightConfigs;
    fieldData.push(payload);
  });

  let columnData = [];
  let mid = Math.ceil(fieldData.length / 2);
  // Split the fields into the two columns
  columnData.push({fields: fieldData.slice(0, mid)});
  columnData.push({fields: fieldData.slice(mid, fieldData.length)});

  return columnData;
}
