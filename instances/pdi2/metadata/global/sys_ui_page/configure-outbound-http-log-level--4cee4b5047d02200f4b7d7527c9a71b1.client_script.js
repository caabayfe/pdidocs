function setLogLevel() {
    var logLevel = gel('log_level').value;
    var logLevelLabel = getLogLevelLabel(logLevel);

    var ga = new GlideAjax('OutboundHTTPLogLevelAjax');
    ga.addParam('sysparm_name', 'setLogLevel');
    ga.addParam('sysparm_outbound_message_type', gel('outbound_message_type').value);
    ga.addParam('sysparm_outbound_message_fn', gel('outbound_message_fn').value);
    ga.addParam('sysparm_outbound_message_log_level', logLevel);

    ga.getXMLAnswer(function(success) {
        if (success == 'true') {
            g_form.addInfoMessage('HTTP Log level set to ' + logLevelLabel);
			if(logLevelLabel == 'All' || logLevelLabel == 'Elevated'){
				g_form.addInfoMessage(new GwtMessage().getMessage('Use caution when enabling the All and Elevated log levels as they can capture sensitive data such as authorization headers or session cookies. Revert back to the Basic log level after troubleshooting.'));
			}
        } else {
            g_form.addErrorMessage('Error while setting HTTP Log level to ' + logLevelLabel);

        }
    });
    GlideDialogWindow.get().destroy();
    return true;

    function getLogLevelLabel(logLevel) {
        if (logLevel == 'all') {
            return 'All';
        } else if (logLevel == 'elevated') {
            return 'Elevated';
        } else if (logLevel == 'basic') {
            return 'Basic';
        }
        return '';
    }
}
