var gwt = new GwtMessage();

function onLoad() {
    var DATA_PATTERN_RELATED_LIST_ENTRY = 'REL:ee3d78afef3122107565c06c7e97d760';
    var DATA_PATTERN_SELECTION_OOB = 'out_of_the_box';

    var configId = g_form.getUniqueValue();
    var ga = new GlideAjax('PrivacySystemProcessorUtilAjax');
    ga.addParam('sysparm_name', 'validateConfig');
    ga.addParam('sysparm_config_id', configId);
    ga.getXMLAnswer(function(responseStr) {
        var response = JSON.parse(responseStr);
        if (!response['success']) {
            displayErrorMessages(response['errors']);
            changePolicyActive(false);
            disableActiveField(true);
        }
    });

    var isScanningOobPatterns = g_form.getValue('data_pattern_selection') == DATA_PATTERN_SELECTION_OOB;
    setRelatedListVisibility(DATA_PATTERN_RELATED_LIST_ENTRY, !isScanningOobPatterns);
    canActivateConfig();
    showInfoMessages(isScanningOobPatterns);
    warnIfUsingLegacyDataPatterns();
}

function showInfoMessages(isScanningOobPatterns) {
    if (g_form.getBooleanValue('active') && isScanningOobPatterns)
        g_form.addInfoMessage(gwt.getMessage('Scanning all out of the box data patterns.'));
}

function warnIfUsingLegacyDataPatterns() {
    var ga = new GlideAjax('PrivacySystemProcessorUtilAjax');
    ga.addParam('sysparm_name', 'isUsingLegacyDataPatterns');
    ga.addParam('sysparm_system_processor_config_id', g_form.getUniqueValue());
    ga.getXMLAnswer(function(responseStr) {
        if (responseStr == 'true') {
            var warningMessage = gwt.getMessage("One or more configured data patterns are from the deprecated 'sn_data_discovery_data_pattern' table. Update them to use patterns from the 'dp_data_pattern' table instead");
            g_form.addInfoMessage(warningMessage);
        }
    });

}

function canActivateConfig() {
    var ga = new GlideAjax('PrivacySystemProcessorUtilAjax');
    ga.addParam('sysparm_name', 'getNumActiveConfigurations');
    ga.addParam('sysparm_system_processor_id', g_form.getValue('system_processor'));
    ga.addParam('sysparm_data_channel_id', g_form.getValue('channel'));
    ga.getXMLWait();

    var numActiveConfigs = parseInt(ga.getAnswer());
    var currentConfigActive = g_form.getBooleanValue('active');

    // alert when there is at least one active config, except when there is exactly one and it’s the current one.
    var warnForMultipleConfigs = (numActiveConfigs > 1) || (numActiveConfigs === 1 && !currentConfigActive);

    if (warnForMultipleConfigs) {
        var warningMessage = gwt.getMessage("One or more configurations for system processor {0} exist.", g_form.getDisplayBox('system_processor').value);
        g_form.addInfoMessage(warningMessage);

        // make active flag read only if current record is not already active. This will ensure users can deactivate this policy. 
        g_form.setReadOnly('active', !currentConfigActive);
    }
}

function setRelatedListVisibility(relatedList, isVisible) {
    if (isVisible)
        g_form.showRelatedList(relatedList);
    else
        g_form.hideRelatedList(relatedList);
}

function disableActiveField(disabled) {
    g_form.setDisabled('active', disabled);
}


function displayErrorMessages(errMsgs) {
    if (errMsgs && errMsgs.length > 0) {
        var inactivePolicyMsg = getMessage("This configuration is inactive because of the following reasons:");
        messages = `<html>${inactivePolicyMsg} <br> ${errMsgs.join('<br>')}</html>`;
        g_form.addErrorMessage(messages);
    }

}

function changePolicyActive(active) {
    var ga = new GlideAjax('PrivacySystemProcessorUtilAjax');
    ga.addParam('sysparm_name', 'switchConfigActiveStatus');
    ga.addParam('sysparm_config_id', g_form.getUniqueValue());
    ga.addParam('sysparm_active', active);
    ga.getXMLAnswer(function(response) {});
}
