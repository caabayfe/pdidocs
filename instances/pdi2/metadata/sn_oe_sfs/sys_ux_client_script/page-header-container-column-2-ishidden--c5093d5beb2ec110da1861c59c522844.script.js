/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	const table = api.context.props.table;
    let hideComponent = true;
    if (table == 'sys_cs_auto_resolution_configuration') {
        hideComponent = false;
    }
    return hideComponent;
}
