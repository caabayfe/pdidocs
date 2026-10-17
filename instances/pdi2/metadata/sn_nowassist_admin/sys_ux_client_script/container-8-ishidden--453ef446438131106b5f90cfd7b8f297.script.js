/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  return api.context.props.payload.guided_context.nap_status.nowAssistPanelEnabled
   || !api.context.props.payload.guided_context.nap_skill_applicability 
   || (!!api.context.props.payload.guided_context.show_nap_card && api.context.props.payload.guided_context.show_nap_card == "false");
}
