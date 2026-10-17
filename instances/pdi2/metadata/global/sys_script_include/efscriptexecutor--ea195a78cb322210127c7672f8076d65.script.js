class EFScriptExecutor {
    constructor() {}
    
    execute(context) {
        try {
            const evaluator = new GlideScopedEvaluator();

            // Handle both individual and bulk actions
            if (context.errorSysIds && Array.isArray(context.errorSysIds))
                evaluator.putVariable('error_sys_ids', context.errorSysIds);
            else
                evaluator.putVariable('error_sys_id', context.errorSysId);
            
            evaluator.putVariable('execution_sys_id', context.executionSysId);
            evaluator.putVariable('params', context.params || {});

            const scriptResult = evaluator.evaluateScript(context.scriptGr, 'script');

            if (!scriptResult || typeof scriptResult !== 'object')
                return {
                    success: false,
                    message: 'Script did not return a valid result object',
                    data: scriptResult
                };

            return {
                success: scriptResult.success === true,
                message: scriptResult.message || (scriptResult.success ? 'Script executed successfully' : 'Script execution failed'),
                data: scriptResult.data || null,
                errorsToClose: scriptResult.errorsToClose || []
            };
        } catch (e) {
            return {
                success: false,
                message: 'Script execution error: ' + e.message,
                data: null
            };
        }
    }

    validateContext(context) {
        if (!context.scriptGr)
            throw new Error(sn_i18n.Message.getMessage("error_framework", "EFScriptExecutor.validateContext: Script is required to execute this action"));

        // Validate that either errorSysId (individual) or errorSysIds (bulk) is provided
        if (!context.errorSysId && !context.errorSysIds)
            throw new Error(sn_i18n.Message.getMessage("error_framework", 'EFScriptExecutor.validateContext: Missing errorSysId or errorSysIds in context'));
        
        if (!context.executionSysId)
            throw new Error(sn_i18n.Message.getMessage("error_framework", "EFScriptExecutor.validateContext: Missing executionSysId in context"));
    }
}
