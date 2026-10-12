/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  const alertmsg = [];
  if(api.state.lifepsan_error == true) {
    alertmsg.push({
      "content": api.state.translatedMessaged.lifepsan_error,
      "status": "critical",
      "icon": "lightbulb-outline"
    });
	  return alertmsg;
  }
}
