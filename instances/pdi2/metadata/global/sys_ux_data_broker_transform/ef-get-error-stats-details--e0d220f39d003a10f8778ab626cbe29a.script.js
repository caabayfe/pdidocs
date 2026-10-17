function transform(input) {
    /**
     * Enhanced function to get detailed error stats information from the error framework stats tables
     * with additional processing for UI display, filters, and KB article extraction
     * 
     * @param {String} statsSysId - Sys ID of the stats record
     * @param {String} tableName - Table name: sys_error_code_stats, sys_error_code_inst_stats, or sys_error_code_src_stats
     * @returns {Object} Result object with error stats information and processed data
     */
    function getErrorStatsEnhanced(statsSysId, tableName) {
        var result = {
            errorStats: [],
            errors: [],
            table: tableName || '',
            sysId: statsSysId || '',
            header: '',
            processedData: {
                filter: '',
                requiredColumns: 'key, message, error_source, state, context, sys_created_on, sys_updated_on',
                labels: [],
                kbArticles: [],
                formattedMessage: '',
                priority: '',
                errorCodeSysId: '',
                messageTable: 'sys_error'
            }
        };

        // Set the message table based on tableName
        result.processedData.messageTable = (tableName === 'sys_error_code_inst_stats') ?
            'sys_error_inst' : 'sys_error';

        try {
            if (!tableName || !statsSysId) {
                result.errors.push('Missing required parameters: tableName or statsSysId.');
                return result;
            }

            // Validate table name
            var validTables = [
                'sys_error_code_stats',
                'sys_error_code_inst_stats',
                'sys_error_code_src_stats'
            ];

            if (validTables.indexOf(tableName) === -1) {
                result.errors.push('Invalid table name. Must be one of: ' + validTables.join(', '));
                return result;
            }

            var errorStatsGr = new GlideRecord(tableName);
            if (errorStatsGr.get(statsSysId)) {
                var errorStats = {
                    _row_data: {
                        uniqueValue: statsSysId
                    },
                    errorCode: {
                        value: errorStatsGr.error_code.getValue(),
                        displayValue: errorStatsGr.error_code.getDisplayValue()
                    },
                    errorCodeSysID: {
                        value: errorStatsGr.getValue('error_code')
                    },
                    errorCodeName: {
                        value: errorStatsGr.error_code.name + ''
                    },
                    category: {
                        value: errorStatsGr.getValue('error_category'),
                        displayValue: errorStatsGr.getDisplayValue('error_category')
                    },
                    sourceApp: {
                        value: errorStatsGr.getValue(EFConstants.ERROR_CODE_STATS_FIELDS.APPLICATION),
                        displayValue: errorStatsGr.getDisplayValue(EFConstants.ERROR_CODE_STATS_FIELDS.APPLICATION)
                    },
                    errorCount: {
                        value: errorStatsGr.getValue('error_count')
                    },
                    ignoredCount: {
                        value: errorStatsGr.getValue('error_ignored_count')
                    },
                    instance: {
                        value: (tableName == 'sys_error_code_inst_stats') ? errorStatsGr.getValue('error_instance') : null,
                        displayValue: (tableName == 'sys_error_code_inst_stats') ? errorStatsGr.getDisplayValue('error_instance') : null,
                        table: (tableName == 'sys_error_code_inst_stats') ? errorStatsGr.getValue('error_instance_table') : null
                    },
                    source: {
                        value: (tableName === 'sys_error_code_src_stats' || tableName === 'sys_error_code_inst_stats') ? errorStatsGr.getValue('error_source') : null,
                        displayValue: (tableName === 'sys_error_code_src_stats' || tableName === 'sys_error_code_inst_stats') ? errorStatsGr.getDisplayValue('error_source') : null,
                        table: (tableName === 'sys_error_code_src_stats' || tableName === 'sys_error_code_inst_stats') ? errorStatsGr.getValue('error_source_table') : null
                    },
                    executionTime: {
                        value: errorStatsGr.getValue('execution_time')
                    },
                    message: {
                        value: ''
                    },
                    actions: []
                };

                // Fetch additional error code details
                var errorCodeGr = new GlideRecord('sys_error_code');
                if (errorCodeGr.get(errorStatsGr.error_code)) {
                    errorStats.severity = {
                        value: errorCodeGr.getValue('severity_label')
                    };
                    errorStats.suppress = {
                        value: errorCodeGr.getValue('suppress')
                    };
                    errorStats.description = {
                        value: errorCodeGr.getValue('description')
                    };
                    errorStats.order = {
                        value: errorCodeGr.getValue('severity')
                    }; // Using numeric severity for order
                }

                // Fetch actions mapped to this error code
                var actionMapGr = new GlideRecord('sys_error_code_to_action_m2m');
                actionMapGr.addQuery('error_code', errorStatsGr.error_code);
                actionMapGr.query();

                while (actionMapGr.next()) {
                    var action = {
                        sys_id: actionMapGr.action + '',
                        name: actionMapGr.action.name + '',
                        type: actionMapGr.action.type + '',
                        message: actionMapGr.action.message + '',
                        order: actionMapGr.order + ''
                    };

                    errorStats.actions.push(action);

                    // If it's a message action, set the message property
                    if (actionMapGr.action.type == 'message')
                        errorStats.message.value = actionMapGr.action.message + '';
                }

                result.header = errorStatsGr.error_code.getDisplayValue();
                result.errorStats.push(errorStats);

                // Process additional data based on handler functions
                processMessageData(errorStats, result);
                processPriorityAndLabels(errorStats, result);
                processFilterAndColumns(errorStats, result, tableName);
            } else {
                result.errors.push('No record found with sys_id: ' + statsSysId + ' in table: ' + tableName);
            }
        } catch (error) {
            result.errors.push(error.toString());
        }

        return result;
    }

    /**
     * Process message data to extract KB articles and format messages
     * @param {Object} errorStats - Error stats data
     * @param {Object} result - Result object to update
     */
    function processMessageData(errorStats, result) {
        var message = errorStats.message.value;

        // Extract KB articles
        var kbData = message.match(/KB\d{1,20}/g);
        if (kbData) {
            // Store raw KB article numbers
            var uniqueKBs = removeDuplicates(kbData);
            result.processedData.kbArticles = uniqueKBs;

            // Format KB articles as clickable links
            var formattedKBs = uniqueKBs.map(function (kb) {
                return {
                    "href": "https://support.servicenow.com/kb?id=kb_article_view&sysparm_article=" + kb,
                    "label": kb,
                    "type": "text-link",
                    "opensWindow": true,
                    "underlined": true
                };
            });
            result.processedData.formattedKBs = formattedKBs;
        } else {
            result.processedData.kbArticles = [];
            result.processedData.formattedKBs = [];
        }

        // Format message for display
        var formattedMessage = message.replace(/<\/?[^>]+(>|$)/g, "").trim();
        if (formattedMessage.length > 200) {
            formattedMessage = formattedMessage.substring(0, 200) + '...';
        }

        result.processedData.formattedMessage = formattedMessage ? formattedMessage : null;
    }

    /**
     * Process priority and create UI labels
     * @param {Object} errorStats - Error stats data
     * @param {Object} result - Result object to update
     */
    function processPriorityAndLabels(errorStats, result) {
        // Use the severity label directly from errorStats (already fetched from error code)
        var severityLabel = errorStats.severity ? errorStats.severity.value : 'medium';

        // Capitalize first letter for display
        var priority = severityLabel.charAt(0).toUpperCase() + severityLabel.slice(1);

        result.processedData.priority = priority;

        // Create labels array for UI
        var labels = [{
            "label": "Severity",
            "value": {
                "type": "highlighted-value",
                "label": priority,
                "color": getColorForPriority(priority),
                "variant": "primary"
            }
        },
        {
            "label": "Error Code",
            "value": {
                "type": "string",
                "value": errorStats.errorCode.displayValue
            }
        },
        {
            "label": "Category",
            "value": {
                "type": "string",
                "value": errorStats.category.displayValue
            }
        },
        {
            "label": "Application",
            "value": {
                "type": "string",
                "value": errorStats.sourceApp.displayValue
            }
        }
        ];

        // Filter out empty values
        labels = labels.filter(function (item) {
            return item.value.value || item.value.color;
        });

        result.processedData.labels = labels;
    }

    /**
     * Process filter and required columns for querying error messages
     * @param {Object} errorStats - Error stats data
     * @param {Object} result - Result object to update
     * @param {String} tableName - Table name
     */
    function processFilterAndColumns(errorStats, result, tableName) {
        var filter = '';
        var requiredColumns = '';

        // Store errorCodeSysId for reference
        result.processedData.errorCodeSysId = errorStats.errorCodeSysID.value;

        // Use the correct message table based on the stats table
        var messageTable = result.processedData.messageTable;

        // Build filter for the appropriate message table
        filter = "error_code.sys_id=" + errorStats.errorCodeSysID.value + "^stateINopen,in_progress^suppress=false";

        // Add instance if available
        if (errorStats.instance && errorStats.instance.value) {
            filter += "^error_instance=" + errorStats.instance.value;
        }

        // Add source if available
        if (errorStats.source && errorStats.source.value) {
            filter += "^error_source=" + errorStats.source.value;
        }

        // Set required columns based on the message table
        if (messageTable === 'sys_error_inst') {
            requiredColumns = "error.key, error.message, error_source, error_instance, error.state, error.context, sys_created_on";
        } else {
            requiredColumns = "key, message, error_source, state, context, sys_created_on, sys_updated_on";
        }

        result.processedData.filter = filter;
        result.processedData.requiredColumns = requiredColumns;
    }

    /**
     * Helper function to remove duplicates from an array
     * @param {Array} data - Array with potential duplicates
     * @returns {Array} Array with duplicates removed
     */
    function removeDuplicates(data) {
        return data.filter(function (value, index) {
            return data.indexOf(value) === index;
        });
    }

    /**
     * Get color for priority level
     * @param {String} priority - Priority level
     * @returns {String} Color name
     */
    function getColorForPriority(priority) {
        var colorMap = {
            "Critical": "critical",
            "High": "high",
            "Moderate": "moderate",
            "Low": "low",
            "Info": "info"
        };

        return colorMap[priority] || "low";
    }

    return getErrorStatsEnhanced(input.statsSysId, input.statsTable);
}
