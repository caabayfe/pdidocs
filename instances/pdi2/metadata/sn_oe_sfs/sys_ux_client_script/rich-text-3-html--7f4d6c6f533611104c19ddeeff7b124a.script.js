/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  var tenant = api.state.tenantName;
  var currentMapping = api.state.currentMapping;

  var text = "<div><p>The Microsoft Teams tenant associated with <b>" + tenant + "</b> is currently registered with instance <b>" + currentMapping + "</b>.</p>";
  text = text + "<p>If you want to proceed with the installation, reach out to your system administrator to first uninstall from <b>" + currentMapping + "</b>.</p>";
  text = text + "<p><b>Note: </b>If your current instance is on <b>Tokyo</b> release but <b>" + currentMapping + "</b> is on pre-Tokyo release, ";
  text = text + "please refer to the <a style='cursor:pointer;text-decoration:none;color:rgb(1, 119, 142);' target='_blank' href='/api/now/v1/context_doc_url/uninstall-msteams-integration'>product documentation</a> for important instructions.</p>"
  text = text + "<p>If the existing installation is already removed, click Refresh to proceed.</p></div>";

	return text;
}
