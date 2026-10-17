/**
  * @param {params} params
  * @param {api} params.api
  * @param {any} params.imports
  */
function evaluateProperty({api}) {
  const tableLabel = api.data.get_table_label.results;
  if (tableLabel && tableLabel.length > 0) {
    return tableLabel[0].label.value;
  }
  return '';
}
