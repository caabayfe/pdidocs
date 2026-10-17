/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  if (!api.state.hasAttachments || !api.state.google_chat_bot_name || !api.state.inbound_service_account_email || !api.state.outbound_service_account_email || !api.state.private_key_password) {
    return true;
  }
}
