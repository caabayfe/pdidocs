/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  const {
    props: {
      referenceField
    }
  } = api.context;
  
   const  attributes = api.data.controller.form.fields[referenceField].dictionary.attributes;
   const maintainOrder = attributes.find(attribute => attribute.name === "maintain_order");
   if(maintainOrder === undefined || maintainOrder.value === "false") return true;
	 return false;
}
