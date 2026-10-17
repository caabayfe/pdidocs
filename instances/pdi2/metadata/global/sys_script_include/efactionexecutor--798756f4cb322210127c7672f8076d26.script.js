/**
 * @class EFActionExecutor
 * @classdesc Base class for executing error actions
 */
class EFActionExecutor {
    constructor() {}
    
    /**
     * Executes an error action
     * @param {Object} context - The error context
     */
    execute(context) {
        // override for error action execution
        return;
    }
    
    /**
     * Validates the error context
     * @param {Object} context - The error context to validate
     */
    validateContext(context) {
        // override for errorMessage context validation
        return;
    }
}
