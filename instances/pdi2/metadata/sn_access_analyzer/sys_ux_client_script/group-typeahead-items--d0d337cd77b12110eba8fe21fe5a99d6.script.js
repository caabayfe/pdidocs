/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  const groupData = [];
  api.data.group_typeahead_resources.results
                  .forEach( ele => groupData.push({"label":ele._row_data.displayValue, 
                      "id": ele._row_data.uniqueValue
                      }));
	return groupData;
}
