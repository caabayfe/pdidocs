class EFFlowActionExecutor {
    constructor() {}

    execute(context) {
        try {
            const inputs = {
                execution_sys_id: context.executionSysId
            };
            
            // Handle both individual and bulk actions
            if (context.errorSysIds && Array.isArray(context.errorSysIds))
                inputs.error_sys_ids = context.errorSysIds;
            else
                inputs.error_sys_id = context.errorSysId;

            inputs.params = context.params || {};

            const runner = new sn_fd.FlowAPI.getRunner()
                .action(context.flowActionName)
                .inForeground()
                .timeout(context.timeout || EFConstants.TIMEOUTS.FLOW_DEFAULT)
                .withInputs(inputs)
                .run();

            const outputs = runner.getOutputs() || {};
            
            // Process the result based on the standardized output format
            const success = outputs?.success === true;
            
            return {
                success: success,
                message: outputs.message || (success ? 'Flow action executed successfully' : 'Flow action execution failed'),
                data: outputs.data || null,
                errorsToClose: outputs.errorsToClose || []
            };
        } catch (e) {
            return {
                success: false,
                message: 'Flow action execution error: ' + e.message,
                data: null
            };
        }
    }

    validateContext(context) {
        if (!context.flowActionName)
            throw new Error(sn_i18n.Message.getMessage("error_framework", "EFFlowActionExecutor.validateContext: Flow action name is required to execute this action"));

        // Validate that either errorSysId (individual) or errorSysIds (bulk) is provided
        if (!context.errorSysId && !context.errorSysIds) {
            throw new Error(sn_i18n.Message.getMessage("error_framework", 'EFFlowActionExecutor.validateContext: Missing errorSysId or errorSysIds in context'));
        }

        if (!context.executionSysId)
            throw new Error(sn_i18n.Message.getMessage("error_framework", "EFFlowActionExecutor.validateContext: Missing executionSysId in context"));
    }
}
