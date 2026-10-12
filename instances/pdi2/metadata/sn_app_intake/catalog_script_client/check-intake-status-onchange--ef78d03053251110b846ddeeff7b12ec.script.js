var loadingDialog;

function showLoading() {
    loadingDialog.render();
}

function hideLoading() {
    loadingDialog.destroy();
}

function onChange(control, oldValue, newValue, isLoading) {
    function runValidation(requestedForUserName) {
        if (!g_user.hasRole("app_engine_admin")) {
            // stop the check since the user can't see the development_environment field
            // as they are not an aes admin
            hideLoading();
            return;
        }

        // check to see if the selected environment has the user and the right version of AES installed
        var validateAesVersion = new GlideAjax('sn_app_intake.ValidateIntakeStatus');
        validateAesVersion.addParam('sysparm_name', 'validate');
        validateAesVersion.addParam('sysparm_dev_environment_sys_id', newValue);
        validateAesVersion.addParam('sysparm_requested_for_user_name', requestedForUserName);
        validateAesVersion.getXML(validate);
    }

    function onBodyRendered() {
        g_form.getReference('requested_for', function(caller) {
            // Call runValidation after getReference has completed
            runValidation(caller.user_name);
        });
    }

    loadingDialog = new GlideModal("sn_app_intake_checking_environment_aes_version", true);
    loadingDialog.setTitle('Check Intake Status');
    loadingDialog.on('bodyrendered', onBodyRendered);

    showLoading();
}

function validate(response) {
    hideLoading();

    try {
        var answer = JSON.parse(response.responseXML.documentElement.getAttribute('answer'));

        if (answer.hasWarning) {
            // Show warning message if the user was not found on the development instance
            g_form.showFieldMsg('development_instance', answer.warningMessage, 'warning');
        }
    } catch (e) {
        jslog(e.message);
    }
}
