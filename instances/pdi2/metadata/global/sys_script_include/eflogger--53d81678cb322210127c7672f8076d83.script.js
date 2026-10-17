/**
 * @class EFLogger
 * @classdesc Centralized logging utility for the Error Framework.
 * Features:
 * - Static methods for quick logging without context
 * - Instance methods with class/module context
 * - Dual logging to system log and/or action execution table
 * 
 * @example
 * // 1. Static usage (quick, no context)
 * EFLogger.info('Processing started');                          // [ERROR_FRAMEWORK] Processing started
 * 
 * // 2. Instance usage (with class context)
 * const logger = EFLogger.forClass('ErrorManager');
 * logger.info('Processing started');                            // [ErrorManager.processRecords] Processing started
 * 
 * // 3. Action execution logging (to database table)
 * logger.setExecutionContext(executionItemId);
 * logger.info('Processing started', true);                      // Logs to action_execution_log table
 * logger.error('Failed to process', true, errorObj);            // Logs to action_execution_log table
 */
class EFLogger {
    constructor(source, sourceApplicationSysId) {
        this.constants = EFConstants;
        this.source = source;
        this._executionItemId = null;
        this._sourceApplicationId = null;
        this._sourceApplicationSysId = sourceApplicationSysId || null;
        this._logLevel = null;
        this._resolvingLogLevel = false;
    }

    /**
     * Returns a cached logger instance for the specified class or module.
     * @param {string} source - Class or module name (e.g. 'ErrorManager', 'ActionExecutor')
     * @param {string} [sourceApplicationSysId] - Optional sys_id of the source application.
     *   Determines the logging level from the application's config (the "logging" property).
     *   If not provided, the Error Framework default config logging level is used.
     * @returns {EFLogger} Cached logger instance
     * @example
     * const logger = EFLogger.forClass('ErrorRepository');
     * const appLogger = EFLogger.forClass('MyModule', sourceAppSysId);
     */
    static forClass(source, sourceApplicationSysId) {
        if (!EFLogger.__loggers)
            EFLogger.__loggers = {};
        
        const cacheKey = sourceApplicationSysId ? `${source}_${sourceApplicationSysId}` : source;
        let logger = EFLogger.__loggers[cacheKey];
        if (!logger) {
            logger = new EFLogger(source, sourceApplicationSysId);
            EFLogger.__loggers[cacheKey] = logger;
        }
        return logger;
    }

    /**
     * Sets the execution context for logging to action execution log table.
     * Once set, you can use the toExecutionLog parameter in logging methods to target the table.
     * @param {string} executionItemId - The sys_id of the action execution item
     * @throws {Error} If executionItemId is missing or execution item not found
     * @example
     * const logger = EFLogger.forClass('ActionProcessor');
     * logger.setExecutionContext(executionItemId);
     * logger.info('Starting process', true);  // Logs to execution table
     * logger.debug('Debug details');          // Logs to system log
     */
    setExecutionContext(executionItemId) {
        if (!executionItemId)
            throw new Error('EFLogger.setExecutionContext: Missing execution item ID');
        
        const itemGr = new GlideRecord(this.constants.TABLES.ERROR_ACTION_EXECUTION_ITEM);
        if (!itemGr.get(executionItemId))
            throw new Error('EFLogger.setExecutionContext: Execution item not found: ' + executionItemId);
        
        this._executionItemId = executionItemId;
        this._sourceApplicationId = itemGr.getValue('source_application');
    }

    /**
     * Extracts the calling function name from the current stack trace.
     * @private
     * @returns {string} Function name or EFLogger.prefix if unable to determine
     */
    static _captureCallerInfo() {
        const stack = new Error().stack;
        if (!stack) return EFLogger.prefix;

        const lines = stack.split('\n');
        // Skip first 4 lines: Error object, _captureCallerInfo, and the logging method
        for (let i = 4; i < lines.length; i++) {
            const line = lines[i].trim();
            
            // ServiceNow Rhino format: "at script_include.xxx:line (FunctionName)"
            let match = line.match(/\(([^)]+)\)\s*$/);
            if (match) {
                const funcName = match[1];
                // Ignore anonymous functions
                if (funcName && funcName !== 'anonymous' && funcName !== '<anonymous>')
                    return funcName;
            }
            
            // Standard JavaScript format: "at ClassName.methodName" or "at methodName"
            match = line.match(/at\s+(?:([\w]+)\.)?([\w]+)/);
            if (match) {
                const className = match[1] || '';
                const methodName = match[2] || '';
                
                // Ignore internal functions and ServiceNow script references
                if (methodName === 'anonymous' || methodName === '<anonymous>' || methodName === 'script')
                    continue;
                
                return className ? `${className}.${methodName}` : methodName;
            }
        }
        return EFLogger.prefix;
    }

    /**
     * Formats a log message by prefixing it with caller context.
     * @private
     * @param {string} message - Raw log message
     * @param {string} [source] - Optional class/module name
     * @returns {string} Formatted message
     */
    static _formatMessage(message, source) {
        const caller = this._captureCallerInfo();
        const prefix = source ? `${source}.${caller}` : caller;
        return prefix ? `[${prefix}] ${message}` : message;
    }


    /**
     * Logs an ERROR level message.
     * @param {string} message - Error message to log
     */
    static error(message) {
        gs.error(this._formatMessage(message));
    }

    /**
     * Logs a WARN level message.
     * @param {string} message - Warning message to log
     */
    static warn(message) {
        gs.warn(this._formatMessage(message));
    }

    /**
     * Logs an INFO level message.
     * @param {string} message - Info message to log
     */
    static info(message) {
        gs.info(this._formatMessage(message));
    }

    /**
     * Logs a DEBUG level message.
     * @param {string} message - Debug message to log
     */
    static debug(message) {
        gs.info('[DEBUG] ' + this._formatMessage(message));
    }

    /**
     * Logs a message to the action execution log table.
     * @private
     * @param {string} message - The message to log
     * @param {string} type - Log type (info, warning, error, debug)
     */
    _logToExecutionTable(message, type) {
        try {
            const logGr = new GlideRecord(this.constants.TABLES.ERROR_ACTION_EXECUTION_LOG);
            logGr.initialize();
            logGr.setValue('action_execution_item', this._executionItemId);
            logGr.setValue('source_application', this._sourceApplicationId);
            logGr.setValue('message', message);
            logGr.setValue('type', type || 'info');
            logGr.insert();
        } catch (e) {
            gs.error('[EFLogger._logToExecutionTable] Failed to create log record: ' + e.message);
        }
    }

    /**
     * Resolves and caches the configured logging level for this logger's source application.
     * Uses EFErrorUtil.getConfigProp with a recursion guard to prevent infinite loops
     * (since EFErrorUtil itself uses EFLogger).
     * @private
     * @returns {string} The logging level ('error', 'warn', 'info', or 'debug')
     */
    _getLogLevel() {
        if (this._logLevel !== null)
            return this._logLevel;

        if (this._resolvingLogLevel)
            return 'error';

        this._resolvingLogLevel = true;
        try {
            const sourceAppId = this._sourceApplicationSysId || EFConstants.ERROR_SOURCE_APP_DEFAULT_SYS_ID;
            this._logLevel = EFErrorUtil.getConfigProp(sourceAppId, EFConstants.CONFIG_PROPERTIES.LOGGING);
        } catch (e) {
            this._logLevel = 'error';
        } finally {
            this._resolvingLogLevel = false;
        }
        return this._logLevel;
    }

    /**
     * Determines whether a message at the given level should be logged
     * based on the configured logging level for this logger's source application.
     * @private
     * @param {string} level - The log level of the message ('error', 'warn', 'info', 'debug')
     * @returns {boolean} True if the message should be logged
     */
    _shouldLog(level) {
        const configuredLevel = this._getLogLevel();
        const levels = EFLogger.LOG_LEVELS;
        const messageLevelValue = levels[level];
        const configuredLevelValue = levels[configuredLevel];
        
        if (messageLevelValue === undefined || configuredLevelValue === undefined)
            return true;
        
        return messageLevelValue <= configuredLevelValue;
    }

    /**
     * Internal logging method that handles both syslog and execution table logging.
     * Only logs if the message level meets the configured logging threshold.
     * @private
     * @param {string} message - The message to log
     * @param {string} level - Log level
     * @param {boolean} toExecutionLog - If true, log to execution table
     */
    _log(message, level, toExecutionLog) {
        if (toExecutionLog && this._executionItemId) {
            const typeMap = { error: 'error', warn: 'warning', info: 'info', debug: 'debug' };
            this._logToExecutionTable(message, typeMap[level]);
        } else {
            if (!this._shouldLog(level))
                return;

            const formattedMsg = EFLogger._formatMessage(message, this.source);
            if (level === 'debug')
                gs.info('[DEBUG] ' + formattedMsg);
            else 
                gs[level](formattedMsg);
        }
    }

    /**
     * Logs an ERROR level message with class context.
     * @param {string} message - Error message to log
     * @param {boolean} [toExecutionLog=false] - If true, logs to execution table
     */
    error(message, toExecutionLog) {
        this._log(message, 'error', toExecutionLog);
    }

    /**
     * Logs a WARN level message with class context.
     * @param {string} message - Warning message to log
     * @param {boolean} [toExecutionLog=false] - If true, logs to execution table
     */
    warn(message, toExecutionLog) {
        this._log(message, 'warn', toExecutionLog);
    }

    /**
     * Logs an INFO level message with class context.
     * @param {string} message - Info message to log
     * @param {boolean} [toExecutionLog=false] - If true, logs to execution table
     */
    info(message, toExecutionLog) {
        this._log(message, 'info', toExecutionLog);
    }

    /**
     * Logs a DEBUG level message with class context.
     * @param {string} message - Debug message to log
     * @param {boolean} [toExecutionLog=false] - If true, logs to execution table
     */
    debug(message, toExecutionLog) {
        this._log(message, 'debug', toExecutionLog);
    }

}
EFLogger.prefix = 'ERROR_FRAMEWORK';
EFLogger.LOG_LEVELS = { error: 0, warn: 1, info: 2, debug: 3 };
