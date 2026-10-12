var TelemetryUIAdaptor = Class.create();
TelemetryUIAdaptor.prototype = {
    initialize: function() {
        this.utils = new TelemetryUtils();
    },

    /**
     * Converts request payload to TelemetryDTO
     * @param {Object} requestPayload - The request payload containing dataConfigurations
     * @param {Object} filterConfigurations - object containing filter configurations
     * @returns {TelemetryDTO} - The converted TelemetryDTO object
     */
    createDTO: function(dataConfiguration, filterConfigurations) {
        if (!dataConfiguration) {
            throw new Error('Request payload is required');
        }

        if (!dataConfiguration.data) {
            throw new Error('data section is required in dataConfiguration');
        }

        var data = dataConfiguration.data;
        var telemetryDto = new TelemetryDTO();
        // Map fields from data section to TelemetryDTO
        if (data?.serviceName?.value) {
            telemetryDto.setServiceName(data.serviceName.value);
        }

        if (data?.metricName?.value) {
            telemetryDto.setMetricName(data.metricName.value);
        }

        if (dataConfiguration.dataType) {
            telemetryDto.setDataType(dataConfiguration.dataType);
        }

        if (data.metricType) {
            telemetryDto.setMetricType(data.metricType);
        }

        let aggregationColumn = dataConfiguration?.aggregationColumn || data?.aggregationColumn;
        if (aggregationColumn)
            telemetryDto.setAggregateColumn(aggregationColumn);

        // Fetches metric from 'dataConfiguration' on initial load, and on UI selection, fetches from 'data' object
        if (dataConfiguration?.metric || data?.metric) {
            if (dataConfiguration?.metric)
                telemetryDto.setAggregateFunction(dataConfiguration?.metric.toUpperCase());
            else if (data?.metric)
                telemetryDto.setAggregateFunction(data?.metric.toUpperCase());
        }

        if (dataConfiguration?.customPercentile?.length > 0) {
            telemetryDto.setCustomePercentile(true);
        }

        if (data?.projections?.length > 0) {
            const projections = data.projections;
            projections.forEach(projection => {
                // Each projection is an object with a single key-value pair
                telemetryDto.addProjection(projection);
            });
        }

        if (data.rollup) {
            telemetryDto.setRollup(data.rollup);
        }

        //Check if the dataConfigType is sparkLine
        if (TelemetryConstants.DATA_CATEGORY.SIMPLE === dataConfiguration.dataCategory && TelemetryConstants.DATA_CONFIG_TYPE.SPARKLINE === dataConfiguration?.dataConfigType)
            telemetryDto.setDataCategory(TelemetryConstants.DATA_CATEGORY.TREND);
        else if (dataConfiguration.dataCategory) {
            telemetryDto.setDataCategory(dataConfiguration.dataCategory);
        }

        if (data?.predicateComposition?.predicate) {
            const predicateProcessor = new TelemetryNextGenPredicateProcessor();
            const predicateDSL = predicateProcessor.getDSL(data.predicateComposition);
            if (predicateDSL)
                telemetryDto.setPredicateComposition(predicateDSL);
        }

        // Map groupBys from data.groupBy (array type)
        if (dataConfiguration.groupBy && Array.isArray(dataConfiguration.groupBy)) {
            telemetryDto.setGroupBys(dataConfiguration.groupBy);

            if (dataConfiguration?.showOther)
                telemetryDto.setIsShowOther(dataConfiguration.showOther);

        }

        if (dataConfiguration?.sortBy) {
            telemetryDto.setSortBy(dataConfiguration.sortBy);
        }

        if (dataConfiguration?.sortOrder) {
            telemetryDto.setSortByOrder(dataConfiguration.sortOrder);
        }

        if (dataConfiguration?.relative_accuracy)
            telemetryDto.setRelativeAccuracy(dataConfiguration.relative_accuracy);

        if (dataConfiguration?.dataCategory === TelemetryConstants.DATA_CATEGORY.TREND || telemetryDto.getDataCategory() === TelemetryConstants.DATA_CATEGORY.TREND) {
            telemetryDto.setTrendByInterval(dataConfiguration.trendInterval);
            telemetryDto.addProjection(telemetryDto.addProjection({
                [TelemetryConstants.START_TIME]: TelemetryConstants.START_TIME
            }));

            var groupBys = telemetryDto.getGroupBys();
            if (groupBys && groupBys.length > 0) {
                groupBys.unshift(TelemetryConstants.START_TIME);
                telemetryDto.setGroupBys(groupBys);
            }
            telemetryDto.setSortBy(TelemetryConstants.START_TIME);
            telemetryDto.setSortByOrder("desc");
        }

        if (data?.isDARequest)
            telemetryDto.setIsDARequest(data?.isDARequest);

        this._setDateAttributes(dataConfiguration, telemetryDto);
        this._setLimit(dataConfiguration, telemetryDto);
        this._setPaging(dataConfiguration, telemetryDto);

        this._setFilters(filterConfigurations, telemetryDto);
        return telemetryDto;
    },

    _setDateAttributes: function(dataConfiguration, telemetryDto) {
        let startTime = dataConfiguration.startTime;
        let endTime = dataConfiguration.endTime;

        //Updating Start and End Date to GlideDateTime
        if (!endTime && startTime?.match(TelemetryConstants.ISO86_DATE_INTERVAL_REGEX)) {
            const dateRange = this.utils.getStartEndDatesByISO86Value(startTime);
            startTime = dateRange.startDate || startTime;
            endTime = dateRange.endDate || endTime;
        } else {
            const {
                startDate,
                endDate
            } = this.utils._sanitizeDateForGlideDateTime(dataConfiguration.startTime, dataConfiguration.endTime);
            startTime = startDate ? this.utils.convertUserTZtoUTC(startDate) : '';
            endTime = endDate ? this.utils.convertUserTZtoUTC(endDate) : '';
        }

        /*
        if (startTime && endTime) {
            dataConfiguration.startTime= startTime;
            dataConfiguration.endTime = endTime;
        }
        */

        telemetryDto.setStartTime(startTime);
        telemetryDto.setEndTime(endTime);
    },

    _setLimit: function(dataConfiguration, telemetryDto) {
        const dataCategory = telemetryDto.getDataCategory();
        const isTrendWithGroupBy = dataCategory === TelemetryConstants.DATA_CATEGORY.TREND && telemetryDto.getGroupBys().length > 0;
        if (["group", "list", TelemetryConstants.DATA_CATEGORY.TREND].includes(dataCategory)) {
            let limit;
            if (dataCategory === "group")
                limit = (dataConfiguration?.numberOfGroups > 0) ? dataConfiguration.numberOfGroups : TelemetryConstants.DEFAULT_NUMBER_OF_GROUPS;
            else if (dataConfiguration?.limit > 0)
                limit = dataConfiguration.limit;
            else if (!isTrendWithGroupBy)
                limit = undefined;
            else
                limit = TelemetryConstants.DEFAULT_NUMBER_OF_RECORDS;

            //set the limit
            telemetryDto.setLimit(limit);
        }

    },

    _setPaging: function(dataConfiguration, telemetryDto) {
        const pageNumber = dataConfiguration.pageNumber;
        // Only allow pagination for list
        if (telemetryDto.getDataCategory() != "list")
            return;

        if (pageNumber > 0)
            telemetryDto.setPageNumber(pageNumber);
        else
            telemetryDto.setPageNumber(1);
    },

    _setFilters: function(filterConfigurations, telemetryDto) {
        try {
            // Input validation
            if (!filterConfigurations || !Array.isArray(filterConfigurations)) {
                gs.debug('TelemetryUIAdaptor._setFilters: No valid filterConfigurations provided');
                return;
            }

            // Process each filter configuration
            for (var i = 0; i < filterConfigurations.length; i++) {
                var filterConfig = filterConfigurations[i];
                try {
                    this._processFilterByType(filterConfig, telemetryDto);
                } catch (error) {
                    gs.error('TelemetryUIAdaptor._setFilters: Error processing filter ' + filterConfig.filterId + ': ' + error.message);
                }
            }

        } catch (error) {
            gs.error('TelemetryUIAdaptor._setFilters: Unexpected error: ' + error.message);
        }
    },

    _processFilterByType: function(filterConfig, telemetryDto) {
        var filterType = filterConfig.type.toUpperCase();
        var filterId = filterConfig.filterId;
        
        // Default values if apply_to is missing or empty
        const defaultApplyTo = { type: '', key: '', payload: null};
        const applyTo = (filterConfig.apply_to && filterConfig.apply_to[0]) || defaultApplyTo;
        
        const {
            type = '',
            key = '',
            payload = null
        } = applyTo;

        var validTypes = [TelemetryConstants.OBSERVABILITY, TelemetryConstants.TABLE];
        if (filterType != 'DATE' && !validTypes.includes(type.toUpperCase())) {
            telemetryDto.addNotAppliedFilter({
                order: filterConfig.order
            });
            return;
        }

        if (this._shouldSkipTableFilterProcessing(filterType, type, telemetryDto, key)) {
            telemetryDto.addNotAppliedFilter({
                order: filterConfig.order
            });
            return;
        }

        // validate the filter source and do not process if its not from a valid resource

        switch (filterType) {
            case 'DATE':
                this._processDateFilter(filterConfig, telemetryDto);
                break;
            case 'CHOICE':
                this._processChoiceFilter(filterConfig, telemetryDto);
                break;
            default:
                telemetryDto.addNotAppliedFilter({
                    order: filterConfig.order
                });
                break;
        }
    },

    _shouldSkipTableFilterProcessing: function(filterType, type, telemetryDto, key) {
        // Skip if not a DATE filter and type is TABLE
        if (filterType !== 'DATE' && type.toUpperCase() === TelemetryConstants.TABLE) {
            // For INBOUT_API_INTEGRATION_METRIC_NAME, only skip if key is not in TABLE_DA_FILTER_DSL_MAP
            if (telemetryDto?.metricName === TelemetryConstants.INBOUT_API_INTEGRATION_METRIC_NAME) {
                return key && !(key in TelemetryConstants.TABLE_DA_FILTER_DSL_MAP);
            }
            return true;
        }
        return false;
    },

    _processDateFilter: function(filterConfig, telemetryDto) {
        try {
            var filterId = filterConfig.filterId;
            const {
                startDate,
                endDate
            } = this.utils.dateFromDynamicDateRange(filterConfig.dynamicTimeRange, filterConfig.start, filterConfig.end);

            // Handle date range filters
            if (startDate && endDate) {
                //Override the dates in the DTO. These dates will be applied as filters.
                telemetryDto.setStartTime(startDate);
                telemetryDto.setEndTime(endDate);

                telemetryDto.addAppliedFilter({
                    order: filterConfig.order
                });
            }else{
				telemetryDto.addNotAppliedFilter({
							     order: filterConfig.order
							 });
				
			 }
            

        } catch (error) {
            gs.error('TelemetryUIAdaptor._processDateFilter: Error processing date filter: ' + error.message);
        }
    },

    _processChoiceFilter: function(filterConfig, telemetryDto) {
        try {
            var filterAdded = false;
            if (filterConfig.apply_to && filterConfig.apply_to.length && filterConfig.values && (
                        (Array.isArray(filterConfig.values) && filterConfig.values.length > 0) ||
                        (!Array.isArray(filterConfig.values) && filterConfig.values !== null && filterConfig.values !== '')
                )) {
                const {
                    payload,
                    type,
                    key
                } = filterConfig.apply_to[0];
                // set filters from filter configuration
                if (payload) {
                    const filterToByApplied = payload[TelemetryConstants.OBSERVABILITY.toLowerCase()];
                    Object.entries(payload).forEach(([key, value]) => {
                        // repalce 'string.', 'number.' to StringAttribute and NumberAttribute in the payload
                        if (key != TelemetryConstants.OBSERVABILITY.toLowerCase() && key != filterToByApplied)
                            telemetryDto.addFilter(this._replaceTypePrefix(key), '$eq', Array.isArray(value) ? value[0] : value);
                    });
                    telemetryDto.addFilter(this._replaceTypePrefix(payload[filterToByApplied]), '$in', filterConfig.values);
                    filterAdded= true;
                }
                if (key) {
                    filterAdded= true;
                    telemetryDto.addFilter(TelemetryConstants.TABLE_DA_FILTER_DSL_MAP[key], '$in', filterConfig.values);
                }
   
            }
            
            if(filterAdded){
                telemetryDto.addAppliedFilter({
                    order: filterConfig.order,
                    apply_to: filterConfig.apply_to[0]
                });
            }else{
				telemetryDto.addNotAppliedFilter({
							     order: filterConfig.order
							 });
				
			 }

        } catch (error) {
            gs.error('TelemetryUIAdaptor._processDateFilter: Error processing date filter: ' + error.message);
        }
    },

    _replaceTypePrefix: function(str) {
        if (str.startsWith('number.')) {
            return str.replace(/^number\./, 'NumberAttributes.');
        } else if (str.startsWith('string.')) {
            return str.replace(/^string\./, 'StringAttributes.');
        }
        return str; // return unchanged if no match
    },

    type: 'TelemetryUIAdaptor'
};
