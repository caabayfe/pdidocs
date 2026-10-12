var ValidateIntakeStatus = Class.create();
ValidateIntakeStatus.prototype = Object.extendsObject(global.AbstractAjaxProcessor, {
    validate: function() {
        var response = {
            hasWarning: false,
            warningMessage: ''
        };

        gs.info('Checking Environment Intake Status...');

        var devEnvironmentSysId = this.getParameter('sysparm_dev_environment_sys_id');
		var requestedForUserName = this.getParameter('sysparm_requested_for_user_name');
        
		if (!devEnvironmentSysId) {
            response.hasWarning = true;
            response.warningMessage = gs.getMessage('A development environment was not found. Configure one in sn_pipeline_environment table or select another instance before approving this request.');
            gs.error(response.warningMessage);
            return JSON.stringify(response);
        }

        // Get the selected development environment
        var environmentGr = new GlideRecord('sn_pipeline_environment');
        environmentGr.get(devEnvironmentSysId);
        if (!environmentGr.isValidRecord() || !environmentGr.canRead()) {
			response.hasWarning = true;
            response.warningMessage = gs.getMessage('Selected development instance is unreadable. Select another instance before approving this request.');
            gs.error(response.warningMessage);
            return JSON.stringify(response);
        }


        var outputs = {};
        try {
            // Set up and run the subflow to verify user and AES exist
            var inputs = {};
            inputs['environment'] = environmentGr;
			inputs['user_name'] = requestedForUserName;

            gs.info('************ starting subflow ' + JSON.stringify(inputs));

            var result = sn_fd.FlowAPI.getRunner()
                .subflow('sn_app_intake.check_intake_status_on_instance_for_user')
                .inForeground()
                .withInputs(inputs)
                .run();

            outputs = result.getOutputs();
            gs.info('Results from check_intake_status_on_instance_for_user: ' + JSON.stringify(outputs));
        } catch (ex) {
            var message = ex.message || ex;
            response.warningMessage = gs.getMessage('Unable to verify intake status for this request: [{0}] Select another instance or manually provision the user to this instance before approving this request.', message);
            response.hasWarning = true;
            gs.error(response.warningMessage);
            return JSON.stringify(response);
        }

        if (!outputs.user_exists) {
            response.hasWarning = true;

            if (outputs.error_code === 0) {
                response.warningMessage = gs.getMessage('The user on the request was not found on this instance. Select another instance or manually provision the user to this instance before approving the request.');
            } else {
				response.warningMessage = gs.getMessage('Unable to verify user on this instance: [{0}] Select another instance or manually provision the user to this instance before approving this request.', outputs.error_message);
            }

            gs.error(response.warningMessage);
            return JSON.stringify(response);
        }

        if (!outputs.is_aes_available) {
            response.hasWarning = true;

            if (outputs.error_type === 'error') {
				response.warningMessage = gs.getMessage('Unable to verify App Engine Studio plugin version on this instance: [{0}] Select another instance or manually provision the user to this instance before approving this request.', outputs.error_message);
            } else {
				response.warningMessage = gs.getMessage("The latest App Engine Studio plugin isn't installed on this instance. Select another instance or manually provision the user to this instance before approving this request.");
            }

            gs.error(response.warningMessage);
            return JSON.stringify(response);
        }

        return JSON.stringify(response);
    },

    type: 'ValidateIntakeStatus'
});
