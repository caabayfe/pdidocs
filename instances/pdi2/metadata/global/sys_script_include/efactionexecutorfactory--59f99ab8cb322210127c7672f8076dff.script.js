/**
 * @class EFActionExecutorFactory
 * @classdesc Factory class for creating appropriate error action executors
 */
class EFActionExecutorFactory {
    constructor() {}
    
    /**
     * Creates an appropriate executor based on the action type
     * @param {string} actionType - The type of action to create an executor for
     * @returns {Object} The executor instance
     * @throws {Error} If the action type is unsupported
     */
    createExecutor(actionType) {
        switch (actionType) {
            case EFConstants.ACTION_TYPES.SCRIPT:
                return new EFScriptExecutor();
            case EFConstants.ACTION_TYPES.SUBFLOW:
                return new EFSubflowExecutor();
            case EFConstants.ACTION_TYPES.FLOW_ACTION:
                return new EFFlowActionExecutor();
            case EFConstants.ACTION_TYPES.SCRIPTED_REST_RESOURCE:
                return new EFRestExecutor();
            default:
                throw new Error(sn_i18n.Message.getMessage("error_framework", "EFActionExecutorFactory.createExecutor: Unsupported action type: {actionType}", {actionType: actionType}));
        }
    }
}
