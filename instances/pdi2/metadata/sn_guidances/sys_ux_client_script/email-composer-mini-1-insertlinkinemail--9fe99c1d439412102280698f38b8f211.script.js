/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  var linkDetails = {
    link: 'kb_view.do?sys_kb_id='+api.context.props.kbSysId,
    title: api.context.props.kbNumber,
    timestamp: Date.now()
  };
	return linkDetails;
}
