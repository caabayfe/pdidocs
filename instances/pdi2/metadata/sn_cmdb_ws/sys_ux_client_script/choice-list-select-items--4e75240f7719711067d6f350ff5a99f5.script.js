/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {

  let choice_list = (api.item.value && api.item.value.attribute && api.item.value.attribute.choice_list) ? [...api.item.value.attribute.choice_list] : null;
  if(choice_list){
    choice_list.forEach((item) => {
      item.id = item.value;
    });
  }

  return choice_list;
}
