/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
   let translatedListTitle = helpers.translateSync(api.context.props.listTitle);
   return translatedListTitle;
}
