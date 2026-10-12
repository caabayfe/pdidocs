function transform(input) {
    /**
     * Function to get encodedQuery and error code sys_id from a stats record
     * 
     * @param {Object} input - Input properties
     * @param {String} input.table - Table name: sys_error_code_stats, sys_error_code_inst_stats, or sys_error_code_src_stats
     * @param {String} input.sysId - Sys ID of the stats record
     * @returns {Object} Result object with encodedQuery and errorCodeSysId
     */
    try {
        const tableName = input.table;
        const statsSysId = input.sysId;

        // Validate required parameters
        if (!tableName || !statsSysId) {
            return EFResponse.failure(EFResponse.EF_ERRORS.MISSING_REQUIRED_PARAMETER)
                .withDetails({
                    missing_fields: !tableName && !statsSysId ? ['table', 'sysId'] : !tableName ? ['table'] : ['sysId']
                })
                .toJSON();
        }

        // Validate table name using constants
        const validTables = [
            EFConstants.TABLES.ERROR_CODE_STATS,
            EFConstants.TABLES.ERROR_CODE_INSTANCE_STATS,
            EFConstants.TABLES.ERROR_CODE_SOURCE_STATS
        ];

        if (validTables.indexOf(tableName) === -1) {
            return EFResponse.failure(EFResponse.EF_ERRORS.VALIDATION_FAILED)
                .withDetails({
                    field: 'table',
                    provided_value: tableName,
                    valid_values: validTables,
                    message: sn_i18n.Message.getMessage('error_framework', 'Invalid table name. Must be one of: {0}', { 0: validTables.join(', ') })
                })
                .toJSON();
        }

        // Fetch the stats record
        const errorStatsGr = new GlideRecord(tableName);
        if (!errorStatsGr.get(statsSysId)) {
            return EFResponse.failure(EFResponse.EF_ERRORS.VALIDATION_FAILED)
                .withDetails({
                    field: 'sysId',
                    provided_value: statsSysId,
                    table: tableName,
                    message: sn_i18n.Message.getMessage('error_framework', 'No record found with sys_id: {0} in table: {1}', { 0: statsSysId, 1: tableName })
                })
                .toJSON();
        }

        const errorCodeSysId = errorStatsGr.getValue(EFConstants.ERROR_CODE_STATS_FIELDS.ERROR_CODE);
        const domain = errorStatsGr.getValue(EFConstants.DOMAIN_FIELDS.SYS_DOMAIN);

        // Build filter for the error message table using constants
        const filterParts = [
            EFConstants.ERROR_FIELDS.REFINED_ERROR_CODE + '.sys_id=' + errorCodeSysId,
            EFConstants.ERROR_FIELDS.STATE + 'IN' + EFConstants.ACTIVE_ERROR_STATES.join(','),
            EFConstants.ERROR_FIELDS.SUPPRESS + '=false',
            EFConstants.DOMAIN_FIELDS.SYS_DOMAIN + '=' + domain
        ];

        // Add source filter if applicable
        if (tableName === EFConstants.TABLES.ERROR_CODE_SOURCE_STATS || 
            tableName === EFConstants.TABLES.ERROR_CODE_INSTANCE_STATS) {
            const sourceId = errorStatsGr.getValue(EFConstants.ERROR_CODE_SOURCE_STATS_FIELDS.ERROR_SOURCE);
            if (sourceId) {
                filterParts.push(EFConstants.ERROR_FIELDS.ERROR_SOURCE + '=' + sourceId);
            }
        }

        const encodedQuery = filterParts.join('^');

        // Return success response
        return EFResponse.success({
            encodedQuery: encodedQuery,
            errorCodeSysId: errorCodeSysId
        })
            .withMetadata({
                table: tableName,
                stats_sys_id: statsSysId
            })
            .toJSON();

    } catch (error) {
        return EFResponse.failure(error)
            .withDetails({
                input_table: input.table,
                input_sysId: input.sysId
            })
            .toJSON();
    }
}
