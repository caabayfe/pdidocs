/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	if(api.item.value.sys_id ) return {"button":{"aria-label": helpers.translateSync('Remove {0} from favorites',api.item.value.headerText)}};
  else return {"button":{"aria-label": helpers.translateSync('Add {0} to favorites',api.item.value.headerText)}};
}
