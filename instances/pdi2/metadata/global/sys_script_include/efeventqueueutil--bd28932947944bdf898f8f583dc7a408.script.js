/**
 * @class EFEventQueueUtil
 * @classdesc Utility for checking per-application event queue configuration.
 * Reads from sys_error_config via EFErrorUtil.getConfigProp with safe defaults.
 */
class EFEventQueueUtil {
    constructor() {}

    /**
     * Returns true if the action event queue is enabled for the given source application.
     * Reads the 'useActionEventQueue' property from sys_error_config.
     * Defaults to false if not configured, ensuring backward compatibility.
     * @param {string} sourceAppSysId - The sys_id of the source application (sys_error_appl)
     * @returns {boolean}
     */
    static isActionEventQueueEnabled(sourceAppSysId) {
        try {
            const asyncConfig = EFErrorUtil.getConfigProp(sourceAppSysId, EFConstants.CONFIG_PROPERTIES.ASYNC);
            return asyncConfig && asyncConfig.actionExecution === true;
        } catch (e) {
            return false;
        }
    }

    /**
     * Returns true if async error processing is enabled for the given source application.
     * Reads the 'async.errorProcessing' property from sys_error_config.
     * Defaults to false if not configured, ensuring backward compatibility.
     * @param {string} sourceAppSysId - The sys_id of the source application (sys_error_appl)
     * @returns {boolean}
     */
    static isAsyncErrorProcessingEnabled(sourceAppSysId) {
        try {
            const asyncConfig = EFErrorUtil.getConfigProp(sourceAppSysId, EFConstants.CONFIG_PROPERTIES.ASYNC);
            return asyncConfig && asyncConfig.errorProcessing === true;
        } catch (e) {
            return false;
        }
    }
}
