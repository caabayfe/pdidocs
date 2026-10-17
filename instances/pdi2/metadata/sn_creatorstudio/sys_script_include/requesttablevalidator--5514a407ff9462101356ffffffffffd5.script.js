const RequestTableValidator = (function() {
    /**
     * Checks if a table extends task.
     * Privately scoped in closure.
     * @param {string} tableName
     * @returns {boolean}
     */
    const isTaskExtension = tableName => global.CreatorStudioRequestAppUtils.baseTableExtendsTask(tableName);

    /**
     * Checks if a table contains the request_type column.
     * Privately scoped in closure.
     * @param {string} tableName
     * @returns {boolean}
     */
    const hasRequestType = tableName => global.CreatorStudioRequestAppUtils.hasRequestType(tableName);

    return class RequestTableValidator extends global.AbstractAjaxProcessor {
        type = 'RequestTableValidator';

        /**
         * Validates the selected request table.
         * @returns {string} JSON string with validation results.
         */
        validateRequestTable() {
            const tableName = this.getParameter('sysparm_table');

            return JSON.stringify({
                isTaskExtension: isTaskExtension(tableName),
                hasRequestType: hasRequestType(tableName)
            });
        }
    }
})();
