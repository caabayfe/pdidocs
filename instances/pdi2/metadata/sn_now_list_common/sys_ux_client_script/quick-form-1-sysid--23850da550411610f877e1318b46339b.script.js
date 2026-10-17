/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  const key = api.data.controller.paneProps.navigationPaneState.currentRecordSysId || api.context.props.sysId;
  const keyArray = key?.split('@');
	return keyArray[keyArray.length-1];
}
