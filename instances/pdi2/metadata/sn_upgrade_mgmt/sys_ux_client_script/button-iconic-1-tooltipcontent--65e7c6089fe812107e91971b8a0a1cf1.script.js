/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  if(api.item.value.sys_id) {
    return helpers.translateSync("Remove {0} from favorites", api.item.value.headerText);
  } else {
    return helpers.translateSync("Add {0} to favorites", api.item.value.headerText);
  }
}
