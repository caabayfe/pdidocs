var loadingDialog = new GlideModal("sn_pipeline_validation_in_progress", true);
loadingDialog.setTitle('Validating');
loadingDialog.on('bodyrendered', getConstants);

var start = function() {
    showLoading();
};

function showLoading() {
    loadingDialog.render();
}

function hideLoading() {
    loadingDialog.destroy();
}

function getConstants() {
    var vE = new GlideAjax('sn_pipeline.ValidateEnvironment');
    vE.addParam('sysparm_name', 'getConstants');
    vE.getXML(validate);
}

var constants;

function validate(response) {
    try {
        constants = JSON.parse(response.responseXML.documentElement.getAttribute('answer'));
        var aC = constants.ajaxConstants;
        var fF = constants.fields;
        var vE = new GlideAjax('sn_pipeline.ValidateEnvironment');
        vE.addParam('sysparm_name', 'validate');
        vE.addParam(aC.IS_CONTROLLER, g_form.getValue(fF.IS_CONTROLLER));
        vE.addParam(aC.URL, g_form.getValue(fF.INSTANCE_URL));
        vE.addParam(aC.CREDENTIAL, g_form.getValue(fF.INSTANCE_CREDENTIAL));
		vE.addParam(aC.ENVIRONMENT_SYS_ID, g_form.getUniqueValue());
        vE.getXML(checkResults);
    } catch (ex) {
        hideLoading();
        g_form.addErrorMessage(ex.message);
    }
}

function checkResults(response) {
    hideLoading();
    try {
        jslog('Validation results:' + response.responseXML.documentElement.getAttribute('answer'));
        var oC = constants.outputConstants;
        var fF = constants.fields;
        var answer = JSON.parse(response.responseXML.documentElement.getAttribute('answer'));
        if (answer && answer.error_code === 0 && answer[oC.RESPONSE_BODY][oC.IS_VALID]) {
            if (isController() && answer[oC.RESPONSE_BODY][oC.SOURCE_INSTANCE] && !answer[oC.RESPONSE_BODY][oC.SOURCE_INSTANCE][oC.FOUND_IN_ENVIRONMENTS]) {
                g_form.addWarningMessage(getMessage('Controller environment has been validated. To complete setup, configure this instance as an environment in the controller instance.'));
            } else if (isController()) {
                g_form.addInfoMessage(getMessage('The controller environment was validated successfully.'));
            } else {
                g_form.addInfoMessage(getMessage('The environment was validated successfully.'));
            }
            var instanceId = answer[oC.RESPONSE_BODY][oC.INSTANCE_ID];
            if (instanceId && g_form.getValue(fF.INSTANCE_ID) != instanceId) {
                g_form.setValue(fF.INSTANCE_ID, instanceId);
                g_form.showFieldMsg(fF.INSTANCE_ID, getMessage('To keep this environment instance id, save or update this record.'));
            }
        } else {
            var errorMessage = isController() ? getMessage('Controller is not valid. ') : getMessage('Could not connect to the environment. ');
            if (answer.error_message)
                errorMessage += '[' + answer.error_message + ']';

            g_form.addErrorMessage(errorMessage);
        }
    } catch (ex) {
        g_form.addErrorMessage(ex);
        g_form.addErrorMessage(getMessage('Something went wrong.'));
    }
}

function isController() {
    return g_form.getValue(constants.fields.IS_CONTROLLER) === 'true';
}
