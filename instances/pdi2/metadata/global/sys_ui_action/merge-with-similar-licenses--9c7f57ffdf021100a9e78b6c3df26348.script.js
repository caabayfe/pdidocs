function retMsg(msg) {
	g_form.clearMessages();
	if (msg.substring(0, 2) === 'id') {
		var sysId = msg.substring(2);
		var gr = new GlideRecord('alm_license');
		gr.get(sysId);
		var url = 'alm_license.do?sys_id=' + sysId;
		window.location = url;
	} else {
		g_form.addErrorMessage(msg);
	}
}
function gsftWarn(title, question, onPromptComplete) {
	var DialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
	var dialog = new DialogClass('glide_confirm_basic');
	dialog.setTitle(title);
	dialog.setPreference('title', question);
	dialog.setPreference('onPromptComplete', onPromptComplete);
	dialog.render();
}
function mergeLicense() {
	var merge = function() {
		var ga = new GlideAjax('AssetUtilsAJAX');
		ga.addParam('sysparm_name', 'mergeLicenses');
		ga.addParam('sysparm_licenseId', g_form.getUniqueValue());
		g_form.addInfoMessage('License merging in progress.');
		ga.getXMLAnswer(function(answer) { retMsg(answer); });
	};
	gsftWarn('Warning', 'Merging records is irreversible and license keys will not be merged.', merge);
}
