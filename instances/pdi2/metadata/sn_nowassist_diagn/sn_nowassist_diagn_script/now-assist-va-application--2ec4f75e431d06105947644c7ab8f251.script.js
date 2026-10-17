diagnose();


function diagnose() {
	//verify plugin versions
	var messages = NowAssistDiagnosticsPackageInstallValidator.validateAll();

	//Now assist is enabled
	var nowAssistSettingsGr = new GlideRecord("sn_nowassist_settings");
	nowAssistSettingsGr.addQuery("name", "Now Assist General Settings");
	nowAssistSettingsGr.query();
	if (nowAssistSettingsGr.next()) {
		if (!nowAssistSettingsGr.active) {
			messages.push(new DiagnosticMessage("Now assist settings record disabled", "Set the \"Now Assist General Settings\" in sn_nowassist_setttings to enabled"));
		}
	} else {
		messages.push(new DiagnosticMessage("Now assist settings record doesn't exist", "Reinstall the nowassist-va plugin"));
	}

	//verify dependent capabilities
	var executor = new NowAssistDiagnosticExcecutor(executionRecordSysId);
	executor.executeByName("VA Skill Search capability");
	executor.executeByName("VA Skill Followup capability");

	return messages;
}
