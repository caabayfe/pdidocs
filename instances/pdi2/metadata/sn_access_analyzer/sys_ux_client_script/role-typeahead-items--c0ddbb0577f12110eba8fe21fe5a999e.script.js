/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  const roleData = [];
  api.data.role_typeahead_resources.results
                  .forEach( ele => roleData.push({"label":ele._row_data.displayValue, 
                      "id": ele._row_data.uniqueValue
                      }));
	return roleData;
}
