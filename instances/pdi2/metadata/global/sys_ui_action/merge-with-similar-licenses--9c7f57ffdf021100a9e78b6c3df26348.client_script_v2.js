function onClick(g_form) {
	var swLicenseId = g_form.getUniqueValue();

	// Merge function
	var merge = function() {
		var ga = new GlideAjax('AssetUtilsAJAX');
		ga.addParam('sysparm_name', 'mergeLicenses');
		ga.addParam('sysparm_licenseId', swLicenseId);
		g_form.addInfoMessage('License merging in progress.');
		ga.getXMLAnswer(function(answer) { retMsg(answer); });
	};
	// Callback function
	function retMsg(msg) {
		g_form.clearMessages();
		g_form.reload();
		if(msg.substring(0,2) == 'id') {
			msg = msg.substring(2);
			g_aw.openRecord("alm_license", msg, { "mode": "form" });
		} else {
			g_form.addErrorMessage(msg);
		}
	}

	// Confirmation warning popup
	var title = getMessage('Warning');
		var msg = getMessage('Merging records is irreversible and license keys will not be merged.');
		var cancelLabel = getMessage('Cancel');
		var okLabel = getMessage('OK');
		g_modal.confirm(
			title,
			msg,
			function (response) {
				if (response) {
					merge();
				}
			}, {
				cancelTitle: cancelLabel,
				confirmTitle: okLabel,
			}
		);
}
