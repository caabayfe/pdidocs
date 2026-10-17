var UXAUIAdaptor = Class.create();
UXAUIAdaptor.prototype = {
    initialize: function() {
        this.utils = new UXAUtils();
        this.logger = QueryServiceApiLogger.getLogger('UXAUIAdaptor');
        this.predicateConstants = new UXANextGenPredicateProcessorConstants();
    },

    createDTO: function(dataConfiguration, filterConfigurations) {
        let uxaDTO = new UXADTO();
        if (dataConfiguration) {
            this._setDataCategory(dataConfiguration, uxaDTO);
            this._setDateAttributes(dataConfiguration, uxaDTO);
            this._setCommonAttributes(dataConfiguration, uxaDTO);
            this._setSelectedColumns(dataConfiguration, uxaDTO);
            this._setCommonAnalysisAttribute(dataConfiguration, uxaDTO);
            this._setChannel(dataConfiguration, uxaDTO);
            this._setFilterConfigurations(uxaDTO, filterConfigurations);
            this._setChangeAttributes(dataConfiguration, uxaDTO);
            this._setTrendAttributes(dataConfiguration, uxaDTO);
            this._setGroupAttributes(dataConfiguration, uxaDTO);
            this._setPredicateComposition(dataConfiguration, uxaDTO);
            this.setFilterAttributes(uxaDTO.getFilterConfigurations(), uxaDTO);
            this._setExportAttributes(dataConfiguration, uxaDTO);
            this._setDASessionsMetricRelatedAttribute(dataConfiguration, uxaDTO);
        }
        return uxaDTO;
    },

    _setFilterConfigurations: function(uxaDTO, filterConfigurations) {
        const transformedFilterConfigurations = this._processFilterConfigurations(uxaDTO, filterConfigurations).filter(filter => filter != false);
        uxaDTO.setFilterConfigurations(transformedFilterConfigurations);
    },

    _setDataCategory: function(dataConfiguration, uxaDTO) {
        const dataCategory = dataConfiguration?.dataCategory;
        if (!(dataCategory && Object.values(UXAConstants.DATA_CATEGORY).includes(dataCategory))) {
            const errMsg = 'Invalid data category. Cannot process the request.';
            this.logger.error(errMsg);
            throw new Error(errMsg);
        }
        if (UXAConstants.DATA_CATEGORY.SIMPLE === dataCategory && UXAConstants.DATA_CONFIG_TYPE.SPARKLINE === dataConfiguration?.dataConfigType)
            uxaDTO.setDataCategory(UXAConstants.DATA_CATEGORY.TREND);
        else
            uxaDTO.setDataCategory(dataCategory);
        uxaDTO.setDataConfigType(dataConfiguration?.dataConfigType);
    },


    _setDateAttributes: function(dataConfiguration, uxaDTO) {
        let startTime = dataConfiguration.startTime;
        let endTime = dataConfiguration.endTime;
        //Updating Start and End Date to GlideDateTime
        if (!endTime && startTime?.match(UXAConstants.ISO86_DATE_INTERVAL_REGEX)) {
            const dateRange = this.utils.getStartEndDatesByISO86Value(startTime);
            startTime = dateRange.startDate || startTime;
            endTime = dateRange.endDate || endTime;
        } else {
            const {
                startDate,
                endDate
            } = this._sanitizeDateForGlideDateTime(dataConfiguration.startTime, dataConfiguration.endTime);
            startTime = startDate ? this.utils.convertUserTZtoUTC(startDate) : '';
            endTime = endDate ? this.utils.convertUserTZtoUTC(endDate) : '';
        }
        uxaDTO.setStartTime(startTime);
        uxaDTO.setEndTime(endTime);
    },

    _setCommonAttributes: function(dataConfiguration, uxaDTO) {
        if (!dataConfiguration.type)
            throw new Error('Type is empty. Cannot process the request.');

        uxaDTO.setUserId(dataConfiguration.userId);
        uxaDTO.setSessionId(dataConfiguration.sessionId);
        uxaDTO.setVisuallyTaggedId(dataConfiguration.visuallyTaggedId);
        uxaDTO.setComponentInstance(dataConfiguration.componentInstance);
        uxaDTO.setApplicationSysId(dataConfiguration.applicationId || dataConfiguration.appSysId || dataConfiguration.AppSysId);
        uxaDTO.setType(dataConfiguration.type);
        if (['crossapp-events', 'singleapp-events'].includes(dataConfiguration.type))
            uxaDTO.setType(UXAConstants.TYPE.EVENTS);

        uxaDTO.setRequestType(dataConfiguration?.requestType);
        uxaDTO.setMetric(dataConfiguration.metric);
        uxaDTO.setMetricDivision(dataConfiguration.metricDivision);
        uxaDTO.setMetricField(dataConfiguration.metricField);
        uxaDTO.setCategory(dataConfiguration.category);
        uxaDTO.setSortOrder(dataConfiguration.sortOrder);
        uxaDTO.setOrderBy(dataConfiguration.orderBy);
        uxaDTO.setEventId(dataConfiguration.events);
        uxaDTO.setPageId(dataConfiguration.pageId);
        uxaDTO.setPageSize(dataConfiguration.pageSize);
        uxaDTO.setPageNumber(dataConfiguration.pageNumber);

        // uxaDTO.setSelectedColumns(dataConfiguration?.columns ? dataConfiguration?.columns : []);

        uxaDTO.setSearchTerm(dataConfiguration.searchTerm);
        uxaDTO.setIsExport(dataConfiguration.isExport);
        uxaDTO.setTraceType(dataConfiguration.traceType);
        uxaDTO.setTypeDivision(dataConfiguration.typeDivision);
        uxaDTO.setBucketType(dataConfiguration.bucketType);
        uxaDTO.setExcludeAttributes(dataConfiguration.excludeAttributes);
        if (dataConfiguration.requestSource)
            uxaDTO.setRequestSource(dataConfiguration.requestSource);
    },

    _setSelectedColumns: function(dataConfiguration, uxaDTO) {
        let selectedColumns = dataConfiguration?.columns ? dataConfiguration?.columns : [];
        if (selectedColumns.length > 0 &&
            UXAConstants.DSL_TYPE.EVENTS === uxaDTO.getType() &&
            !selectedColumns.includes(UXAConstants.APPSEE_EVENT_TYPE)) {
            selectedColumns.push(UXAConstants.APPSEE_EVENT_TYPE);
        }

        uxaDTO.setSelectedColumns(selectedColumns);
    },

    _setCommonAnalysisAttribute: function(dataConfiguration, uxaDTO) {
        // Funnel attributes
        uxaDTO.setSysId(dataConfiguration.sysId);
        uxaDTO.setLegacyId(dataConfiguration.legacyId);

        // Navigation Paths attributes
        uxaDTO.setNavPageName(dataConfiguration.navPageId);
        uxaDTO.setSamplingLevel(dataConfiguration.samplingLevel || dataConfiguration.sampleSize);
    },

    _setChannel: function(dataConfiguration, uxaDTO) {
        const channel = this.utils.getChannel(uxaDTO.getApplicationSysId());
        if (channel || channel == 0)
            uxaDTO.setChannel(channel);

    },

    _setChangeAttributes: function(dataConfiguration, uxaDTO) {
        uxaDTO.setIncludeChange(dataConfiguration.includeChange == true);
        uxaDTO.setIncludeChangePercentage(dataConfiguration.includeChangePercentage == true);
    },

    _setTrendAttributes: function(dataConfiguration, uxaDTO) {
        uxaDTO.setTrendInterval(dataConfiguration.trendInterval?.toLowerCase());
        uxaDTO.setIncludeTrendData(dataConfiguration.includeTrendData == true);
        uxaDTO.setIncludeSparkline(dataConfiguration.includeSparkline == true);
        if (uxaDTO.getDataCategory() == UXAConstants.DATA_CATEGORY.TREND) {
            uxaDTO.setTrendInterval(dataConfiguration.trendInterval?.toLowerCase() || UXAConstants.TREND_INTERVAL.DAILY);
            if (!uxaDTO.getMetric())
                uxaDTO.setMetric(UXAConstants.METRIC_PAR_MAPPING[uxaDTO.getDataCategory()]);
        }
    },

    _setGroupAttributes: function(dataConfiguration, uxaDTO) {
        const groupbyToMap = dataConfiguration?.groupBy || [];

        const transformedGroupbys = groupbyToMap.map(groupby => {
            return groupby.replaceAll(UXAConstants.DOT_REPLACE_STRING, '.');
        });

        uxaDTO.setGroupBys(transformedGroupbys);

        if (dataConfiguration?.numberOfGroups)
            uxaDTO.setNumberOfGroups(dataConfiguration.numberOfGroups);

        if (dataConfiguration?.showOther)
            uxaDTO.setIsShowOther(dataConfiguration.showOther);
    },

    _setExportAttributes: function(dataConfiguration, uxaDTO) {
        uxaDTO.setIsExport(dataConfiguration.isExport);
        uxaDTO.setEventProperties(dataConfiguration.eventProperties);
        if (dataConfiguration.isExport) {
            uxaDTO.setPageSize(UXAConstants.EXPORT_LIMIT);
            uxaDTO.setPageNumber(1);
        }
    },

    _setDASessionsMetricRelatedAttribute: function(dataConfiguration, uxaDTO) {
        if (dataConfiguration?.metric) {
            switch (dataConfiguration?.metric) {
                case UXAConstants.PAR_METRIC_FIELD.AVERAGE_PAGES_PER_SESSION:
                    uxaDTO.setMetric(UXAConstants.METRIC.AVERAGE);
                    uxaDTO.setMetricField(UXAConstants.TYPE.PAGES);
                    break;
                case UXAConstants.PAR_METRIC_FIELD.AVERAGE_SESSIONS_PER_USER:
                    uxaDTO.setMetric(UXAConstants.METRIC.AVERAGE);
                    uxaDTO.setMetricField(UXAConstants.METRIC_FIELD.SESSIONS_PER_USER);
                    break;
                case UXAConstants.PAR_METRIC_FIELD.AVERAGE_SESSION_DURATION:
                    uxaDTO.setMetric(UXAConstants.METRIC.AVERAGE);
                    uxaDTO.setMetricField(UXAConstants.METRIC_FIELD.DURATION);
                    break;
                default:
                    break;
            }
        }
    },

    _setPredicateComposition: function(dataConfiguration, uxaDTO) {
        if (dataConfiguration?.predicateComposition?.predicate) {
            uxaDTO.setPredicateComposition(dataConfiguration.predicateComposition);
        }
    },

    setFilterAttributes: function(filterConfigurations, uxaDTO) {
        let filters = [];

        this.setFilterValues(filters, UXAConstants.DATA_POINTS_COLUMNS.APPLICATION, uxaDTO.getApplicationSysId());
        this.setFilterValues(filters, UXAConstants.DATA_POINTS_COLUMNS.SESSIONID, uxaDTO.getSessionId());
        this.setFilterValues(filters, UXAConstants.DATA_POINTS_COLUMNS.USER_ID, uxaDTO.getUserId());
        this.setFilterValues(filters, UXAConstants.DATA_POINTS_COLUMNS.CHANNEL, uxaDTO.getChannel());
        this.setFilterValues(filters, UXAConstants.DATA_POINTS_COLUMNS.TRACE_TYPE, uxaDTO.getTraceType());
        if (uxaDTO.getTypeDivision() != UXAConstants.ACTIVE)
            this.setFilterValues(filters, UXAConstants.DATA_POINTS_COLUMNS.USER_TYPE_STATE, uxaDTO.getTypeDivision());

        // check request contains predicateComposition and add dsl accordingly
        if (Object.keys(uxaDTO.getPredicateComposition()).length > 0) {
            const advanceFilters = uxaDTO.getPredicateComposition();
            if (advanceFilters)
                this.setAdvancedFilter(filters, uxaDTO.getPredicateComposition());
        }

        if (uxaDTO.getCategory() === UXAConstants.CATEGORY.NEW_USERS) {
            this.setFilterValues(filters, UXAConstants.DATA_POINTS_COLUMNS.USER_TYPE_STATE, UXAConstants.USER_TYPE.NEW);
        }

        //Add EventId as filter
        if (UXAConstants.TYPE.PAGES == uxaDTO.getType())
            this.setFilterValues(filters, UXAConstants.DATA_POINTS_COLUMNS.STR_SYS_PROP_EVENT, uxaDTO.getEventId());
        else
            this.setFilterValues(filters, UXAConstants.DATA_POINTS_COLUMNS.NAME, uxaDTO.getEventId());

        //Add PageId as filter 
        //Dont add the pageId in the filter if metric = next-page-views or metric = previous-page-views, as this breaks the prev and next page navigation
        if (uxaDTO.getPageId() && ![UXAConstants.METRIC.PAGE_NAV.BAR_METRIC_NEXT_PAGE, UXAConstants.METRIC.PAGE_NAV.BAR_METRIC_PREVIOUS_PAGE].includes(uxaDTO.getMetric())) {
            let fieldName = UXAConstants.DATA_POINTS_COLUMNS.NAME;
            if (UXAConstants.TYPE.EVENTS == uxaDTO.getType())
                fieldName = UXAConstants.DATA_POINTS_COLUMNS.STR_SYS_PROP_PAGE;
            else if (UXAConstants.TYPE.PERFORMANCE == uxaDTO.getType())
                fieldName = UXAConstants.DATA_POINTS_COLUMNS.PAGE_ID;
            this.setFilterValues(filters, fieldName, uxaDTO.getPageId());
        }

        //Add the filters for event to ensure the respective event property exists. At the moment, the event properties are passed in dataConfigurations groupBy. Hence, checking event property from uxaDTO.getGroupBys()
        if (UXAConstants.TYPE.EVENTS == uxaDTO.getType() && uxaDTO.getGroupBys()?.length) {
            const groupBys = uxaDTO.getGroupBys();
            if (groupBys?.length) {
                for (let groupBy of groupBys) {
                    if (this._isEventProperty(groupBy)) {
                        const filterObj = {};
                        filterObj[UXAConstants.DSL_OPERATORS.HAS_PROPERTY] = groupBy;
                        filters.push(filterObj);
                    }
                }
            }
        }

        //For Average Duration on Page Details, set the filter Duration > 0
        if (UXAConstants.TYPE.PAGES == uxaDTO.getType() && (
                //Score Visualisations
                (uxaDTO.getMetric() === UXAConstants.METRIC.AVERAGE && uxaDTO.getMetricField() === UXAConstants.METRIC_FIELD.DURATION) ||
                //Table Visualisations
                (uxaDTO.getMetric() === UXAConstants.METRIC.TABLE && uxaDTO.getSelectedColumns().includes(UXAConstants.AVERAGE_VIEW_TIME))
            )) {
            const durationFilterObj = {};
            const durationFilter = {};
            durationFilter[UXAConstants.DSL_OPERATORS.GREATER_THAN] = 0;
            durationFilterObj[UXAConstants.DURATION] = durationFilter;
            filters.push(durationFilterObj);
        }

        //Add searchTerm as filter
        if (uxaDTO.getSearchTerm()) {
            if (UXAConstants.TYPE.EVENTS == uxaDTO.getType())
                this.setFilterValues(filters, UXAConstants.DATA_POINTS_COLUMNS.NAME, `%${uxaDTO.getSearchTerm()}%`, UXAConstants.DSL_OPERATORS.ILIKE);
            else if (UXAConstants.TYPE.PAGES == uxaDTO.getType() && uxaDTO.getApplicationSysId()) {
                //Get updated page display names.
                const params = {
                    app_sys_id: uxaDTO.getApplicationSysId(),
                    channel: uxaDTO.getChannel()
                };
                let pageNames = new QueryServiceAPI().getPageNames(params, uxaDTO.getSearchTerm());
                pageNames = Object.assign({}, ...pageNames.map(item => ({
                    [item.k]: item.v
                })));
                if (Object.keys(pageNames).length) {
                    let operator = UXAConstants.DSL_OPERATORS.IN;
                    let pageIds = Object.keys(pageNames);
                    if (Object.keys(pageNames).length === 1) {
                        operator = UXAConstants.DSL_OPERATORS.EQUALS;
                        pageIds = pageIds.toString();
                    }
                    this.setFilterValues(filters, UXAConstants.DATA_POINTS_COLUMNS.NAME, pageIds, operator);
                } else
                    this.setFilterValues(filters, UXAConstants.DATA_POINTS_COLUMNS.NAME, `%${uxaDTO.getSearchTerm()}%`,
                        UXAConstants.DSL_OPERATORS.ILIKE);
            } else if (UXAConstants.TYPE.APPLICATION == uxaDTO.getType()) {
                //Add the application level filter
                let applications = new UXAApplicationUtils().getAllAppsForUser();
                const searchText = uxaDTO.getSearchTerm();
                //Filter the applications for which appName includes searchText
                applications = applications.filter(application => application.AppName.toLowerCase().includes(searchText.toLowerCase()));
                const applicationIds = applications.map(application => application.AppSysId);
                if (applicationIds?.length) {
                    this.setFilterValues(filters, UXAConstants.DATA_POINTS_COLUMNS.APPLICATION, applicationIds,
                        UXAConstants.DSL_OPERATORS.IN);
                } else {
                    this.setFilterValues(filters, UXAConstants.DATA_POINTS_COLUMNS.APPLICATION, `%${uxaDTO.getSearchTerm()}%`, UXAConstants.DSL_OPERATORS.ILIKE);
                }
            }
        }

        this.setApplicationTableFilters(filters, uxaDTO);
        this._addExcludeAttributes(filters, uxaDTO);
        this.applyFilters(filters, filterConfigurations, uxaDTO);
        uxaDTO.setFilters(filters);
    },

    applyFilters: function(filterArray, filterConfigurations, uxaDTO) {
        let eventPropertyFilters = [];

        //Apply Date filter
        this.applyDateFilter(filterArray, filterConfigurations, uxaDTO);

        const userPropertiesfilterArr = [];
        //Filter choice filters
        filterConfigurations?.forEach((filter, index) => {
            if (UXAConstants.UXA_FILTER_TYPE.DATE == filter.type?.toLowerCase()) {
                // Already date filter is handled on top
                return;
            }
            let fieldName;
            let filterValues = filter.values;
            let operator = UXAConstants.DSL_OPERATORS.IN;

            //Get filterId from sysId
            const sysId = this._removeAppseeFilterPrefix(filter.sysId);
            let filterId = this._removeAppseeFilterPrefix(filter.filterId);
            filterId = sysId || filterId;

            if (!filterId) {
                uxaDTO.getProcessedFilters().notAppliedFilters.push(filter.order);
                return;
            }

            switch (filterId) {
                case UXAConstants.UXA_FILTER_ID.COUNTRY:
                    fieldName = UXAConstants.DATA_POINTS_COLUMNS.COUNTRY;
                    break;
                case UXAConstants.UXA_FILTER_ID.APPLICATION:
                    fieldName = UXAConstants.DATA_POINTS_COLUMNS.APPLICATION;
                    break;
                case UXAConstants.UXA_FILTER_ID.CHANNEL:
                    fieldName = UXAConstants.DATA_POINTS_COLUMNS.CHANNEL;
                    break;
                case UXAConstants.UXA_FILTER_ID.LOCALE:
                    fieldName = UXAConstants.DATA_POINTS_COLUMNS.LOCALE;
                    break;
                case UXAConstants.UXA_FILTER_ID.OPERATING_SYSTEM:
                    fieldName = UXAConstants.DATA_POINTS_COLUMNS.OPERATING_SYSTEM;
                    break;
                case UXAConstants.UXA_FILTER_ID.VERSION:
                    fieldName = UXAConstants.DATA_POINTS_COLUMNS.OS_VERSION;
                    break;
                case UXAConstants.UXA_FILTER_ID.APP_VERSION:
                    fieldName = UXAConstants.DATA_POINTS_COLUMNS.APP_VERSION;
                    break;
                case UXAConstants.UXA_FILTER_ID.USER_TYPE:
                    //For NEW user, NEW userType filter added, do not add the same again.
                    if (!(UXAConstants.TYPE.SESSIONS == uxaDTO.getType() && uxaDTO.getTypeDivision() === 'new'))
                        fieldName = UXAConstants.DATA_POINTS_COLUMNS.USER_TYPE_STATE;
                    break;
                case UXAConstants.UXA_FILTER_ID.EVENT_PROPERTY:
                    fieldName = '$event';
                    operator = '$or';
                    filterValues.forEach((property) => {
                        const propertyFilter = {
                            "alias": "VF",
                            "$hasProperty": {
                                "field": property
                            }
                        };
                        if (uxaDTO.getType() === UXAConstants.DSL_TYPE.EVENTS) {
                            fieldName = '';
                            this.setFilterValues(filterArray, fieldName, propertyFilter, operator, userPropertiesfilterArr);
                        } else
                            eventPropertyFilters.push(propertyFilter);
                    });
                    filterValues = eventPropertyFilters;
                    break;
                case UXAConstants.UXA_FILTER_ID.PAGE:
                    fieldName = UXAConstants.DATA_POINTS_COLUMNS.NAME;
                    if (UXAConstants.TYPE.EVENTS == uxaDTO.getType())
                        fieldName = UXAConstants.DATA_POINTS_COLUMNS.STR_SYS_PROP_PAGE;
                    else if (UXAConstants.TYPE.SESSIONS == uxaDTO.getType()) {
                        const sessionPageFilter = [];
                        this.setFilterValues(sessionPageFilter, fieldName, filterValues, UXAConstants.DSL_OPERATORS.IN);
                        fieldName = '$page';
                        operator = '$and';
                        filterValues = sessionPageFilter;
                    }
                    break;
                case UXAConstants.UXA_FILTER_ID.EVENT:
                    fieldName = UXAConstants.DATA_POINTS_COLUMNS.NAME;
                    if (UXAConstants.TYPE.PAGES == uxaDTO.getType())
                        fieldName = UXAConstants.DATA_POINTS_COLUMNS.STR_SYS_PROP_EVENT;
                    else if (UXAConstants.TYPE.EVENTS !== uxaDTO.getType()) {
                        const eventFilter = [];
                        this.setFilterValues(eventFilter, fieldName, filterValues, UXAConstants.DSL_OPERATORS.IN);
                        fieldName = '$event';
                        operator = '$and';
                        filterValues = eventFilter;
                    }
                    break;
                case UXAConstants.UXA_FILTER_ID.STATE:
                    fieldName = UXAConstants.DATA_POINTS_COLUMNS.STATE;
                    break;
                default:
                    fieldName = filterId;
                    break;
            }
            if (fieldName && filterValues) {
                this.setFilterValues(filterArray, fieldName, filterValues, operator, userPropertiesfilterArr);
                uxaDTO.getProcessedFilters().appliedFilters.push(filter.order);
            }
        });

        //If there is userProperties, add it to filterArray
        if (userPropertiesfilterArr.length) {
            const userPropertiesFilterObject = {};
            userPropertiesFilterObject["$userProperty"] = {
                "$and": userPropertiesfilterArr
            };
            filterArray.push(userPropertiesFilterObject);
        }
    },

    applyDateFilter: function(filterArray, filterConfigurations, uxaDTO) {
        const {
            startDate,
            endDate
        } = this.utils.getDateRange(filterConfigurations, uxaDTO);

        const timestampColumn = this.utils.getTimestampColumn(uxaDTO);

        this.setFilterValues(filterArray, timestampColumn, startDate, UXAConstants.DSL_OPERATORS.GREATER_THAN_EQUALS);
        this.setFilterValues(filterArray, timestampColumn, endDate, UXAConstants.DSL_OPERATORS.LESS_THAN);
    },

    _addExcludeAttributes: function(filterArray, uxaDTO) {
        const excludeAttributes = uxaDTO.getExcludeAttributes();
        excludeAttributes.forEach(item => {
            const fieldName = item.attribute ? UXAConstants.DATA_POINTS_COLUMNS[item.attribute.toUpperCase()] : item.attribute;
            let filterValues = item.value;
            let operator = UXAConstants.DSL_OPERATORS.NOT_EQUALS;
            if (filterValues?.length > 1) {
                operator = UXAConstants.DSL_OPERATORS.NOT;
                filterValues = {
                    "$in": filterValues
                };
            } else
                filterValues = filterValues.toString();

            this.setFilterValues(filterArray, fieldName, filterValues, operator);
        });
    },

    setFilterValues: function(filterArray, fieldName, fieldValue, operator = UXAConstants.DSL_OPERATORS.EQUALS, userPropertiesfilterArr = []) {
        if (fieldValue) {
            const filterObj = {};
            const filterObjAttr = {};

            //Add other sys_user role and group properties in userPropertiesfilterArr.
            if (this.predicateConstants.CUSTOM_USER_PROPERTIES_LIST_KEYS.some(item => fieldName.includes(item))) {
                filterObjAttr["field"] = fieldName;
                filterObjAttr["value"] = fieldValue;
                filterObj["alias"] = fieldName;
                filterObj[this.predicateConstants.CUSTOM_USER_PROPERTIES_OPERATOR_MAP.is_any] = filterObjAttr;
                userPropertiesfilterArr.push(filterObj);
            } else {
                if (Array.isArray(fieldValue) && fieldValue?.length == 1 && !this.utils.isObjectArray(fieldValue)) {
                    operator = UXAConstants.DSL_OPERATORS.EQUALS;
                    fieldValue = fieldValue.toString();
                }
                if (fieldName.startsWith('BooleanUserProperties'))
                    fieldValue = fieldValue === 'true' ? true : false;

                //Add other sys_user properties first in userPropertiesfilterArr
                if (fieldName.includes('sys_user')) {
                    filterObjAttr[operator] = fieldValue;
                    filterObj[fieldName] = filterObjAttr;
                    userPropertiesfilterArr.push(filterObj);
                } else {
                    if (!fieldName) {
                        // to add event properties directly to the filter
                        filterArray.push(fieldValue);
                    } else {
                        filterObjAttr[operator] = fieldValue;
                        filterObj[fieldName] = filterObjAttr;
                        filterArray.push(filterObj);
                    }
                }
            }
        }
    },

    setAdvancedFilter: function(filterArray, predicateComposition) {
        const predicateProcessor = new UXANextGenPredicateProcessor();
        const predicateDSL = predicateProcessor.getDSL(predicateComposition);
        filterArray.push(predicateDSL);
    },

    setApplicationTableFilters: function(filters, uxaDTO) {
        if (!uxaDTO.getApplicationSysId()) {
            const channelFilter = [];

            const uxaAppUtils = new UXAApplicationUtils();
            let channels = uxaAppUtils.getChannelsForUser();
            channels = channels.filter(channel => channel != 'chat');
            channels = channels.map(channel => (channel === 'NextExperience' ? 'NowExperience' : channel));
            channels.forEach(channel => {
                const channelCode = UXAConstants.CHANNEL_ENUM[channel.toUpperCase()];
                if (channelCode)
                    this.setFilterValues(channelFilter, UXAConstants.DATA_POINTS_COLUMNS.CHANNEL, channelCode.ID.toString());
            });

            //Add OR Condition object in parent filter
            const orFilterConditionsObject = {};
            orFilterConditionsObject[UXAConstants.DSL_OPERATORS.OR] = channelFilter;
            filters.push(orFilterConditionsObject);
        }
    },

    _removeAppseeFilterPrefix: function(str = '') {
        return str.replace('appsee.', '');
    },

    _isEventProperty: function(field) {
        const properties = ["StringProperties", "BooleanProperties", "NumberProperties", "DateProperties", "StringSystemProperties", "NumberSystemProperties", "StringUserProperties", "BooleanUserProperties", "NumberUserProperties"];
        return properties.some(property => field.includes(property));
    },

    _processFilterConfigurations: function(uxaDTO, filterConfigurations) {
        // Fetch available user properties once to improve performance
        const availableUserProperties = new QueryServiceAPI().getCustomUserProperties();

        // Iterate through filter configurations to transform and filter them
        return filterConfigurations.map(filter => {
            let transformedFilterId = null;

            // if filter is date then just return it
            if (UXAConstants.UXA_FILTER_TYPE.DATE == filter.type?.toLowerCase()) {
                return filter;
            }

            // Check if sysId exists and transform it using the utility method
            if (filter?.sysId) {
                transformedFilterId = this.utils.transformValidFilter(filter.sysId, availableUserProperties, uxaDTO);
            } else if (Array.isArray(filter?.apply_to) && filter.apply_to.length > 0) {
                transformedFilterId = filter.apply_to
                    .map(item => this.utils.transformValidFilter(item, availableUserProperties, uxaDTO))
                    .find(result => result);
            }

            // If a valid transformation was found, update the filter with the transformed sysId
            if (transformedFilterId) {
                filter.sysId = transformedFilterId;
                return filter;
            }

            // Special handling for filters where sysId starts with UXAConstants.APPSEE
            if (filter.sysId && filter.sysId.startsWith(UXAConstants.APPSEE)) {
                return filter;
            }

            // If no valid sysId transformation, mark filter as not applied
            uxaDTO.getProcessedFilters().notAppliedFilters.push(filter.order);

            // Return false to indicate the filter was not applied
            return false;
        });
    },

    _sanitizeDateForGlideDateTime: function(startTime = '', endTime = '') {
        const dates = {
            startDate: startTime?.replace('T', ' '),
            endDate: endTime?.replace('T', ' ')
        }

        // Convert UTC date to local time if needed.
        // NOTE: DA sends timestamps in UTC, while UXA uses local time.
        // To ensure consistency across the app, we convert UTC to local time before proceeding.
        if (dates.startDate?.includes('Z')) {
            const gd = new GlideDateTime(dates.startDate);
            dates.startDate = `${gd.getLocalDate()} 00:00:00`;
        }

        if (dates.endDate?.includes('Z')) {
            const gd = new GlideDateTime(dates.endDate);
            dates.endDate = `${gd.getLocalDate()} 23:59:59`;
        }

        return dates;
    },

    type: 'UXAUIAdaptor'
};
