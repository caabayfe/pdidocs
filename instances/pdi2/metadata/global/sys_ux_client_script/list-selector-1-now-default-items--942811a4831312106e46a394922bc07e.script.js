/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  
  const rows = api.data.list_controller_4.rowDefinitions.rows;

  const tableName = api.data.record_3.form.fields.name.value;

  const filteredData = {
    [tableName]: {}  
  };

  rows.forEach(row => {
    const element = row.cells && row.cells.element;
    const columnLabel = row.cells && row.cells.column_label;

    const elementValue = element ? element.value : null;  
    const columnLabelValue = columnLabel ? columnLabel.value : null;  

    if (elementValue && columnLabelValue) {
      filteredData[tableName][elementValue] = {
        label: columnLabelValue
      };
    } 
  });

  return filteredData;
}
