/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	return [ 
    
    {
      label: helpers.translateSync("Class"), 
      value: api.item.value.template_class_name
    },
    {
      label: helpers.translateSync("Scheduled"), 
      value: api.item.value.template_scheduleLabel
    }, 
    {
      label: helpers.translateSync("Library"), 
      value: api.item.value.template_library_name
    }
  ];
}
