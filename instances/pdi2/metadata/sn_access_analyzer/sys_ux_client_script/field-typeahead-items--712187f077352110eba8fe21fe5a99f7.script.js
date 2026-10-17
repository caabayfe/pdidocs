/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  const fieldData = [];
  api.data.field_typeahead_resources.output
                  .forEach( ele => fieldData.push({"label":ele.label, 
                      "id": ele.name
                      }));
	return fieldData;
}
