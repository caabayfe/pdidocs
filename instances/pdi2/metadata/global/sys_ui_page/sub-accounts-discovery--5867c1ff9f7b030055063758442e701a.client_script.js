onLoad();

function onLoad() {
    var inputEccQueueSysId = $('input_ecc_queue_sysid_text').value,
        agent = $('agent_text').value,
        cloudProvider = $('cloud_provider_text').value;

    checkProgress(inputEccQueueSysId, agent, cloudProvider);
}

function closeWindow() {
    GlideDialogWindow.get().destroy();
}

function handleOk() {
    closeWindow();
    window.location.reload();
}

function handleCancel() {
    var glideAjax = new GlideAjax('SubAccountsDiscoveryAjax');
    glideAjax.addParam('sysparm_name', 'cancelDiscovery');
    glideAjax.addParam('sysparm_discovery_status_sys_id', $('discovery_status_sysid_text').value);

    glideAjax.getXML();

    closeWindow();
}

function handleSuccess() {
    $('pattern_in_progress').hide();
    $('pattern_successful').show();
}

function handleError(error, cloudProvider) {
    $('pattern_in_progress').hide();
    $('pattern_failed').show();
    document.getElementById(cloudProvider).show();

    if (error)
        notificationMessage(error);
}

function handleErrorForMandatoryFieldEmpty(ecc_sys_id, cloudProvider) {
    var glideAjax = new GlideAjax('SubAccountsDiscoveryAjax');
    glideAjax.addParam('sysparm_name', 'getMandatoryFieldErrorMessage');
    glideAjax.addParam('sysparm_discovery_status_sys_id', $('discovery_status_sysid_text').value);
    glideAjax.getXMLWait();

    var result = glideAjax.getAnswer();
    $('pattern_in_progress').hide();
    $('pattern_failed').show();
    document.getElementById(cloudProvider).show();

    if (result)
        document.getElementById('err_text').innerHTML = result;
}

function parseResult(ecc_sys_id, cloudProvider) {
    var glideAjax = new GlideAjax('SubAccountsDiscoveryAjax');
    glideAjax.addParam('sysparm_name', 'parsePatternResult');
    glideAjax.addParam('sysparm_ecc_sys_id', ecc_sys_id);
    glideAjax.getXMLWait();

    var result = glideAjax.getAnswer();
    if (result === 'success')
        handleSuccess();
    else if (result === 'mandatory_field_empty')
        handleErrorForMandatoryFieldEmpty(ecc_sys_id, cloudProvider);
    else
        handleError(result, cloudProvider);
}

function checkProgress(ecc_sys_id, agent, cloudProvider) {
    var glideAjax = new GlideAjax('SubAccountsDiscoveryAjax');

    glideAjax.addParam('sysparm_name', 'checkProgress');
    glideAjax.addParam('sysparm_ecc_sys_id', ecc_sys_id);

    if (agent)
        glideAjax.addParam('sysparm_agent', agent);
    glideAjax.getXMLWait();

    var result = glideAjax.getAnswer();
    if (result.substring(0, 5) == 'error') {
        handleError(result, cloudProvider);
        return;
    }

    if (result.substring(0, 10) == 'processing') {
        setTimeout(function() {
            checkProgress(ecc_sys_id, agent, cloudProvider);
        }, 5000);
        return;
    }

    parseResult(result, cloudProvider);
}

function actionOK() {
    triggerCredentialTest();
}

function notificationMessage(msg) {
    var options = {};
    options.text = "<b style='color:red;'>" + msg + "</b>";
    options.fadeIn = 0;
    options.fadeOut = 500;
    options.closeDelay = 5000;
    options.sticky = false;
    options.type = 'warn';

    new NotificationMessage(options);
}
