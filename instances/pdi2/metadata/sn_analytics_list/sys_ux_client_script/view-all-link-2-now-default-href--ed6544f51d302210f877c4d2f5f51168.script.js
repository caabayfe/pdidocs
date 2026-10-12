/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	let tableUrl = api.context.props.table + '_list.do';
  if(api.data.list_controller_3?.current?.concatenatedQuery) {
    tableUrl = 'now/nav/ui/classic/params/target/' + encodeURIComponent(tableUrl + '?sysparm_query=' + encodeURIComponent(api.data.list_controller_3.current.concatenatedQuery));
  }
  return tableUrl;
}
