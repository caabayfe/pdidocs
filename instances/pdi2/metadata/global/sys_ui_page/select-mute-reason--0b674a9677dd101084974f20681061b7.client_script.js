function closeDialog() {
    GlideModal.get().destroy();
}

function actionOK() {
	var ga = new GlideAjax("ScanMuteRule"); 
	ga.addParam("sysparm_mute_reason_sys_id", gel('reason_picker').value);
	ga.addParam("sysparm_name", "muteFindings");
	ga.addParam("sysparm_findings_sys_id", gel('test_obj_list').value);

	closeDialog();
	var response = ga.getXML(ajaxResponse);
}

function ajaxResponse(serverResponse) {
	var result = serverResponse.responseXML.getElementsByTagName("result");
	var message = result[0].getAttribute("message");
	var u_g_form = new GlideForm('',true,true,true,true);
	u_g_form.addInfoMessage(message);
	location.reload();
}
