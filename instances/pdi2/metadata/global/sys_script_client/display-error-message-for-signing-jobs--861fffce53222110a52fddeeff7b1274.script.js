function onLoad() {
	var ga = new GlideAjax('CodeSigningUtil');
	ga.addParam('sysparm_name', 'isServiceNowRoTDisableWithRequiredCerts');
	ga.getXML(displayErrorMessage);

	function displayErrorMessage(response) {
		var answer = response.responseXML.documentElement.getAttribute("answer");
		var obj = JSON.parse(answer);

		if (obj.isCodeSigningEnabled)
			g_form.addErrorMessage(getMessage('Signing Jobs cannot be created or run on the Protected instance. Please create and run a job to sign the records on the Trusted instance and export the signed records to the Protected instance'));
		else if (obj.attestModuleCertificatePresent === false)
			g_form.addErrorMessage(getMessage('Please upload key-pair to cm_code_attest module and install the certificate in the Protected instance in order to use signing job'));
		else if (obj.attestModuleCertificateValid === false)
			g_form.addErrorMessage(getMessage('The verification certificate for cm_code_attest module is out-side of its validity period. Please install a valid certificate in order to use the signing job'));
	}
}
