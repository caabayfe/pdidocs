/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  var data = api.context.props.filterData;
  var date = api.context.props.filterDate;
  var payloadTitle = api.context.props.filterPayloadTitle;
	
  if(api.state.show_only_long_running_flows)
    return "state=IN_PROGRESS^ORstate=CONTINUE_SYNC^ORstate=QUEUED^sys_updated_onRELATIVELT@hour@ago@1";

  if((payloadTitle==="Last 14 Days' Flow Executions in CANCELLED, PRESUMED_INTERRUPTED, ERROR state"
    || payloadTitle==="Last 14 Days' Flow Executions in COMPLETE state")
    && data && date && data.elements[0]){
    return "state="+data.elements[0]+"^sys_created_onON"+date+"@javascript:gs.dateGenerate('"+date+"','start')@javascript:gs.dateGenerate('"+date+"','end')";
  }

  if(payloadTitle==="Today's Top 10 Flow Designer Executions"
  && data && data.elements[0]) {
    var scopeAndFlowName = data.elements[0];
    var arr = scopeAndFlowName.split(".", 2);
    var scope = arr[0];
    var flow = arr[1];
    return "sys_created_onONToday@javascript:gs.beginningOfToday()@javascript:gs.endOfToday()^name="+flow;
  }

  return "sys_created_onRELATIVEGT@hour@ago@24";
}
