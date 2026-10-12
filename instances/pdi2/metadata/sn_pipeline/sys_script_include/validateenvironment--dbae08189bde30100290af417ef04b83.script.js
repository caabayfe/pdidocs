var ValidateEnvironment = Class.create();
ValidateEnvironment.prototype = Object.extendsObject(global.AbstractAjaxProcessor, {

    getConstants: function() {
		gs.debug('Getting constants');
        var constants = {
            ajaxConstants: PipelineConstants.ajaxParameters.environmentValidation,
            inputConstants: PipelineConstants.flow.environmentValidation.input,
            outputConstants: PipelineConstants.flow.environmentValidation.output,
            actions: PipelineConstants.flow.environmentValidation.actions,
			fields: PipelineConstants.formFields
        };
        gs.debug('Returning constants ' + JSON.stringify(constants));
        return JSON.stringify(constants);
    },
    validate: function() {
        try {
            var ajaxConstants = PipelineConstants.ajaxParameters.environmentValidation;
            var inputConstants = PipelineConstants.flow.environmentValidation.input;
            var outputConstants = PipelineConstants.flow.environmentValidation.output;
            var actions = PipelineConstants.flow.environmentValidation.actions;

            gs.info('Validating...');
			var grEnvironment = new GlideRecord(PipelineConstants.table.ENVIRONMENT_TABLE);
			grEnvironment.get(this.getParameter(ajaxConstants.ENVIRONMENT_SYS_ID));
			
			if (!grEnvironment.canRead()) {
				return JSON.stringify({
					error_message: gs.getMessage("User does not have read access to this environment record"),
					error_code: 1
				});
			}
			
            var isController = this.getParameter(ajaxConstants.IS_CONTROLLER) === 'true';
            var inputs = {};
            inputs[inputConstants.URL] = this.getParameter(ajaxConstants.URL);
			
			if (this.getParameter(ajaxConstants.CREDENTIAL)) {
				var grAlias = new GlideRecordSecure('sys_alias');
				if (grAlias.get(this.getParameter(ajaxConstants.CREDENTIAL))) {
					inputs[inputConstants.CREDENTIAL] = grAlias;
				} else {
					return JSON.stringify({
						error_message: gs.getMessage("User does not have read access to the environment's credential record"),
						error_code: 1
					});
				}
			} else {
				inputs[inputConstants.CREDENTIAL] = grEnvironment.instance_credential.getRefRecord();
			}
            
            if (isController) {
                inputs[inputConstants.SOURCE_INSTANCE_ID] = gs.getProperty('instance_id');
                if (this.getParameter(ajaxConstants.PIPELINE_TYPE_NAME))
                    inputs[inputConstants.PIPELINE_TYPE_NAME] = this.getParameter(ajaxConstants.PIPELINE_TYPE_NAME);
            }
			var action = isController ? actions.CONTROLLER : actions.CONNECTION;
            gs.info('Running ' + action + ' with inputs: ' + JSON.stringify(inputs));
            var result = sn_fd.FlowAPI.getRunner()
                .action(action)
                .inForeground()
                .withInputs(inputs)
                .run();
            var outputs = result.getOutputs();
            gs.info('Results from '+ action +': ' + JSON.stringify(outputs));
            return JSON.stringify(outputs);
        } catch (ex) {
            gs.error(ex.getMessage());
            var message = gs.getMessage('Please check URL and credentials.');
            return JSON.stringify({
                error_message: message,
                error_code: 1
            });
        }
    },
    type: 'ValidateEnvironment'
});
