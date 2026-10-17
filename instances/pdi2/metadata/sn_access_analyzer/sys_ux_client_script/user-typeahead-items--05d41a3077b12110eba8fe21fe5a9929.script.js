/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  const userData = [];
  api.data.user_typeahead_resources.results
                  .forEach( ele => userData.push({"label":ele._row_data.displayValue, 
                      "id": ele._row_data.uniqueValue,
                      "sublabel": ele.email.value}));
	return userData;
}
