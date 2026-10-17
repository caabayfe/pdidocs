/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	return [
    {
      label: helpers.translateSync("Template count"), 
      value: {
        type: "string", 
        value: api.state.templateCount
      }
    }, 
    {
      label: helpers.translateSync("Templates running"), 
      value: {
        type: "string", 
        value: api.state.templateRunningCount
      }
    }
  ];
}
