function transform(input) {
    /**
     * Paginated retrieval of error stats records from various stats tables
     * Supports filtering by error_source, error_instance, or other fields
     * Supports ordering by direct fields or referenced fields via dot-walking (e.g., 'error_code.severity')
     * 
     * @param {String} statsTable - Table name (sys_error_code_stats, sys_error_code_src_stats, sys_error_code_inst_stats)
     * @param {String} filterField - Field to filter on (e.g., 'error_source', 'error_instance', 'source_application')
     * @param {String} filterValue - Value to filter by (sys_id)
     * @param {Number} page - Page number (1-based)
     * @param {Number} pageSize - Number of records per page
     * @param {String} orderBy - Field to order by (default: 'error_count'). Supports dot-walking for referenced fields (e.g., 'error_code.severity', 'error_code.severity_label')
     * @param {String} orderDirection - 'DESC' or 'ASC' (default: 'DESC')
     * @returns {Object} Paginated result with stats records
     */
    function getPaginatedStats(statsTable, filterField, filterValue, page, pageSize, orderBy, orderDirection) {
        var paginationDefaults = {
            page: page || 1,
            pageSize: pageSize || 20,
            totalCount: 0,
            totalPages: 0,
            hasMore: false
        };

        try {
            // Validate required parameters
            if (!statsTable) {
                return EFResponse.failure(EFResponse.EF_ERRORS.MISSING_REQUIRED_PARAMETER)
                    .withDetails({ missing_fields: ['statsTable'] })
                    .toJSON();
            }

            // Validate table name using EFConstants
            var validTables = [
                EFConstants.TABLES.ERROR_CODE_STATS,
                EFConstants.TABLES.ERROR_CODE_SOURCE_STATS,
                EFConstants.TABLES.ERROR_CODE_INSTANCE_STATS
            ];

            if (validTables.indexOf(statsTable) === -1) {
                return EFResponse.failure(EFResponse.EF_ERRORS.VALIDATION_FAILED)
                    .withDetails({
                        field: 'statsTable',
                        provided_value: statsTable,
                        valid_values: validTables,
                        message: 'Invalid statsTable. Must be one of: ' + validTables.join(', ')
                    })
                    .toJSON();
            }

            // Set defaults
            var currentPage = parseInt(page) || 1;
            var limit = parseInt(pageSize) || 20;
            var offset = (currentPage - 1) * limit;
            var sortField = orderBy || EFConstants.ERROR_CODE_STATS_FIELDS.ERROR_COUNT;
            var sortDirection = (orderDirection && orderDirection.toUpperCase() === 'ASC') ? 'ASC' : 'DESC';

            // Build query for total count
            var countGr = new GlideAggregate(statsTable);
            
            // Add filter if provided
            if (filterField && filterValue) {
                countGr.addQuery(filterField, filterValue);
            }
			
            // Exclude info severity errors by default
            countGr.addQuery(EFConstants.ERROR_CODE_STATS_FIELDS.ERROR_CODE + '.' + EFConstants.ERROR_CODE_FIELDS.SEVERITY_LABEL, '!=', EFConstants.SEVERITY_LEVELS.INFO);
            // Exclude suppressed error codes
            countGr.addQuery(EFConstants.ERROR_CODE_STATS_FIELDS.ERROR_CODE + '.' + EFConstants.ERROR_CODE_FIELDS.SUPPRESS, false);

            // Count total records
            countGr.addAggregate('COUNT');
            countGr.query();
            
            var totalCount = 0;
            if (countGr.next()) {
                totalCount = parseInt(countGr.getAggregate('COUNT'));
            }

            paginationDefaults.totalCount = totalCount;
            paginationDefaults.totalPages = Math.ceil(totalCount / limit);
            paginationDefaults.hasMore = currentPage < paginationDefaults.totalPages;

            // If no records found, return early with success response
            if (totalCount === 0) {
                return EFResponse.success([], {
                    pagination: paginationDefaults,
                    filters: {
                        statsTable: statsTable,
                        filterField: filterField,
                        filterValue: filterValue
                    }
                }).toJSON();
            }

            // Query for paginated data
            var statsGr = new GlideRecord(statsTable);
            
            // Add filter if provided
            if (filterField && filterValue) {
                statsGr.addQuery(filterField, filterValue);
            }

            // Exclude info severity errors by default
            statsGr.addQuery(EFConstants.ERROR_CODE_STATS_FIELDS.ERROR_CODE + '.' + EFConstants.ERROR_CODE_FIELDS.SEVERITY_LABEL, '!=', EFConstants.SEVERITY_LEVELS.INFO);
            // Exclude suppressed error codes
            statsGr.addQuery(EFConstants.ERROR_CODE_STATS_FIELDS.ERROR_CODE + '.' + EFConstants.ERROR_CODE_FIELDS.SUPPRESS, false);

            // Add ordering
            if (sortDirection === 'DESC') {
                statsGr.orderByDesc(sortField);
            } else {
                statsGr.orderBy(sortField);
            }
            
            // Apply pagination
            statsGr.chooseWindow(offset, offset + limit);
            statsGr.query();

            // Process results
            var records = [];
            while (statsGr.next()) {
                var record = buildStatsRecord(statsGr, statsTable);
                records.push(record);
            }

            // Return success response with data and metadata
            return EFResponse.success(records)
                .withMetadata({
                    pagination: paginationDefaults,
                    filters: {
                        statsTable: statsTable,
                        filterField: filterField,
                        filterValue: filterValue
                    }
                })
                .toJSON();

        } catch (error) {
            return EFResponse.failure(error)
                .withDetails({
                    input_statsTable: statsTable,
                    input_filterField: filterField,
                    input_filterValue: filterValue
                })
                .toJSON();
        }
    }

    /**
     * Build a stats record object from GlideRecord
     * @param {GlideRecord} statsGr - GlideRecord instance
     * @param {String} tableName - Table name
     * @returns {Object} Formatted stats record
     */
    function buildStatsRecord(statsGr, tableName) {
        var record = {
            sys_id: statsGr.getUniqueValue(),
            error_code: {
                value: statsGr.getValue(EFConstants.ERROR_CODE_STATS_FIELDS.ERROR_CODE),
                displayValue: statsGr.getDisplayValue(EFConstants.ERROR_CODE_STATS_FIELDS.ERROR_CODE),
                name: statsGr.error_code.name + ''
            },
            error_category: {
                value: statsGr.getValue(EFConstants.ERROR_CODE_STATS_FIELDS.CATEGORY),
                displayValue: statsGr.getDisplayValue(EFConstants.ERROR_CODE_STATS_FIELDS.CATEGORY),
                icon: statsGr.error_category.icon + '' || 'key-outline'
            },
            source_application: {
                value: statsGr.getValue(EFConstants.ERROR_CODE_STATS_FIELDS.APPLICATION),
                displayValue: statsGr.getDisplayValue(EFConstants.ERROR_CODE_STATS_FIELDS.APPLICATION)
            },
            error_count: parseInt(statsGr.getValue(EFConstants.ERROR_CODE_STATS_FIELDS.ERROR_COUNT)) || 0,
            error_ignored_count: parseInt(statsGr.getValue(EFConstants.ERROR_CODE_STATS_FIELDS.ERROR_IGNORED_COUNT)) || 0,
            sys_created_on: statsGr.getValue('sys_created_on'),
            sys_updated_on: statsGr.getValue('sys_updated_on')
        };

        // Add error_source for src_stats and inst_stats tables
        if (tableName === EFConstants.TABLES.ERROR_CODE_SOURCE_STATS || 
            tableName === EFConstants.TABLES.ERROR_CODE_INSTANCE_STATS) {
            record.error_source = {
                value: statsGr.getValue(EFConstants.ERROR_CODE_SOURCE_STATS_FIELDS.ERROR_SOURCE),
                displayValue: statsGr.getDisplayValue(EFConstants.ERROR_CODE_SOURCE_STATS_FIELDS.ERROR_SOURCE),
                table: statsGr.getValue(EFConstants.ERROR_CODE_SOURCE_STATS_FIELDS.ERROR_SOURCE_TABLE)
            };
        }

        // Add error_instance for inst_stats table
        if (tableName === EFConstants.TABLES.ERROR_CODE_INSTANCE_STATS) {
            record.error_instance = {
                value: statsGr.getValue(EFConstants.ERROR_CODE_INSTANCE_STATS_FIELDS.ERROR_INSTANCE),
                displayValue: statsGr.getDisplayValue(EFConstants.ERROR_CODE_INSTANCE_STATS_FIELDS.ERROR_INSTANCE),
                table: statsGr.getValue(EFConstants.ERROR_CODE_INSTANCE_STATS_FIELDS.ERROR_INSTANCE_TABLE)
            };
        }

        // Fetch additional error code details via dot-walking (same pattern as line 151)
        record.severity = {
            value: statsGr.error_code.severity_label + '',
            numericValue: parseInt(statsGr.error_code.severity) || 0
        };
        record.suppress = (statsGr.error_code.suppress + '') == 'true';

        return record;
    }

    // Main execution
    return getPaginatedStats(
        input.statsTable,
        input.filterField,
        input.filterValue,
        input.page,
        input.pageSize,
        input.orderBy,
        input.orderDirection
    );
}
