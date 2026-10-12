diagnose();

function diagnose() {

	var diagnosticMessages = [];
	try {
		diagnosticMessages = NowAssistDiagnosticsPackageInstallValidator.validateAll();
	} catch(error) {
		diagnosticMessages.push(new DiagnosticMessage('Error validating packages: ' + error));
	}

	return diagnosticMessages;
}
