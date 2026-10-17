/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  const tableData = [];
  api.data.table_typeahead_resources.results
                  .forEach( ele => tableData.push({"label":ele._row_data.displayValue, 
                      "id": ele.name.value,
                      "sublabel": ele.name.value}));
	return tableData;
}
