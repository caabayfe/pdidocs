/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  var botName = api.context.props.botName;
	return `<div style="font-size:16px;line-height:20px;text-align:center;"><p><b>\'${botName}\'</b> added to ServiceNow.</p>
  <p>Your bot won't be available to others until you configure and publish it. To learn how to publish, 
  use our <a href="#" target="_blank" style="color:#01778E;text-decoration:none;">step-by-step guide.</a></p></div>` ;
}
