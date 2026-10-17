var UXAUtils = Class.create();
UXAUtils.prototype = {
    initialize: function() {},

    /**
     * Get the color for an event type to be used in highlightedValue
     * @param {string} eventType - The event type value
     * @returns {string} - The color name
     */
    getEventTypeColor: function(eventType) {
        if (eventType === 'visually_tagged') {
            return 'magenta';
        }
        if (eventType === 'oob_tagged') {
            return 'yellow';
        }
        return 'positive';
    },

    addToQueryParams: function(queryParams, params) {
        for (let param in params) {
            if (params[param])
                queryParams[param] = [params[param]];
        }
    },

    constructParams: function(params) {
        for (const key in params) {
            if (Array.isArray(params[key]))
                params[key] = params[key][0];
        }
    },

    removeParams: function(params, removingParams) {
        removingParams.forEach(key => {
            delete params[key];
        });
    },

    fetchMetadata: function(sys_id, table, columns) {
        var gr = new GlideRecord(table);
        gr.addQuery(UXAConstants.SYS_ID, sys_id);
        gr.query();
        var result = {};
        if (gr.next()) {
            columns.forEach(function(column) {
                result[column] = gr.getValue(column);
            });
        }
        return result;
    },

    calculateDayDifference: function(firstDate, secondDate) {
        var diff = GlideDateTime.subtract(firstDate, secondDate);
        return diff.getRoundedDayPart();
    },

    formatDate: function(date) {
        let month = "" + (date.getMonth() + 1);
        let day = "" + date.getDate();
        const year = date.getFullYear();

        if (month.length < 2) {
            month = "0" + month;
        }

        if (day.length < 2) {
            day = "0" + day;
        }

        return [year, month, day].join("-");
    },

    getStartEndDatesByISO86Value: function(startTimeISO86Str) {
        const dateRange = {};
        if (startTimeISO86Str.match(UXAConstants.ISO8_DATE_INTERVAL_REGEX)) {
            const [interval, period] = startTimeISO86Str.slice(1).match(/\d{1,}|\w{1}/g);
            const periodType = UXAConstants.RELATIVE_DATE_PERIOD_MAPPING[period];
            let endTime = this.getUserGDT();
            let startTime = this.getUserGDT();
            switch (periodType) {
                case UXAConstants.RELATIVE_DATE_PERIOD_MAPPING.D:
                    startTime.addDaysUTC(-1 * interval);
                    break;
                case UXAConstants.RELATIVE_DATE_PERIOD_MAPPING.W:
                    startTime.addWeeksUTC(-1 * interval);
                    break;
                case UXAConstants.RELATIVE_DATE_PERIOD_MAPPING.M:
                    startTime.addMonthsUTC(-1 * interval);
                    break;
                case UXAConstants.RELATIVE_DATE_PERIOD_MAPPING.Y:
                    startTime.addYearsUTC(-1 * interval);
                    break;
            }
            startTime = `${startTime.getDate().getValue()} 00:00:00`;
            endTime = `${endTime.getDate().getValue()} 23:59:59`;
            dateRange.startDate = this.convertUserTZtoUTC(startTime);
            dateRange.endDate = this.convertUserTZtoUTC(endTime);
        }
        return dateRange;
    },

    subtractFromDate: function(date, period, numberOfPeriods) {
        let parsedDate = typeof date === 'string' ? new Date(date) : date;

        switch (period) {
            case "day":
                parsedDate.setDate(parsedDate.getDate() - numberOfPeriods);
                break;
            case "week":
                parsedDate.setWeek(parsedDate.getWeek() - numberOfPeriods);
                break;
            case "month":
                parsedDate.setMonth(parsedDate.getMonth() - numberOfPeriods);
                break;
            case "year":
                parsedDate.setFullYear(parsedDate.getFullYear() - numberOfPeriods);
                break;
        }

        return this.formatDate(parsedDate);
    },

    getDateRange: function(filterConfigurations, uxaDTO, metadataFlag) {
        const filterArray = [];
        let startDate = '';
        let endDate = '';
        filterConfigurations?.forEach((filter, index) => {
            if (UXAConstants.UXA_FILTER_TYPE.DATE == filter.type?.toLowerCase()) {
                const dates = this.dateFromDynamicDateRange(filter.dynamicTimeRange, filter.start, filter.end);
                startDate = dates.startDate;
                endDate = dates.endDate;
                if (uxaDTO) {
                    uxaDTO.setStartTime(startDate);
                    uxaDTO.setEndTime(endDate);
                    uxaDTO.getProcessedFilters().appliedFilters.push(filter.order);
                }
            }
        });
        if (!startDate && uxaDTO) {
            startDate = uxaDTO.getStartTime();
            endDate = uxaDTO.getEndTime();
        }

        if (!(startDate && endDate)) {
            //For metadata API request, if the dates are missing in DTO/filterConfigurations, set the date range for last 2 years
            const dates = metadataFlag ? this.getLastXDaysDateRange(730) : this.getLastXDaysDateRange();
            startDate = this.convertUserTZtoUTC(dates.startDate);
            endDate = this.convertUserTZtoUTC(dates.endDate);
            if (uxaDTO) {
                uxaDTO.setStartTime(startDate);
                uxaDTO.setEndTime(endDate);
            }
        }

        //For metadata, return only date with 'yyyy-MM-dd' format.
        if (metadataFlag)
            return {
                startDate: startDate.getDate().getValue(),
                endDate: endDate.getDate().getValue()
            };

        return {
            startDate,
            endDate
        };
    },

    dateFromDynamicDateRange: function(dynamicTimeRange, start, end) {
        let startDate;
        let endDate;
        if (dynamicTimeRange) {
            dynamicTimeRange = dynamicTimeRange.replace('SN_DYNAMIC_DATERANGE__', '');
            let dates = {};
            switch (dynamicTimeRange) {
                case 'TODAY':
                    dates = this.getLastXDaysDateRange(0);
                    break;
                case 'YESTERDAY':
                    dates = this.getLastXDaysDateRange(1);
                    endDate = new GlideDateTime(dates.endDate);
                    endDate.addDaysUTC(-1);
                    dates.endDate = endDate;
                    break;
                case 'LAST_7_DAYS':
                    dates = this.getLastXDaysDateRange(7);
                    break;
                case 'LAST_30_DAYS':
                    dates = this.getLastXDaysDateRange(30);
                    break;
                case 'LAST_60_DAYS':
                    dates = this.getLastXDaysDateRange(60);
                    break;
                case 'LAST_90_DAYS':
                    dates = this.getLastXDaysDateRange(90);
                    break;
                case 'THIS_MONTH':
                    startDate = this.getUserGDT();
                    startDate.setDayOfMonthUTC(1);
                    startDate = startDate.getDate().getValue();
                    dates.startDate = `${startDate} 00:00:00`;

                    endDate = this.getUserGDT();
                    endDate.addMonthsUTC(1);
                    endDate.setDayOfMonthUTC(1);
                    endDate.addDaysUTC(-1);
                    endDate = endDate.getDate().getValue();
                    dates.endDate = `${endDate} 23:59:59`;
                    break;
            }
            startDate = dates.startDate;
            endDate = dates.endDate;
        }

        startDate = this.convertUserTZtoUTC(startDate || start);
        endDate = this.convertUserTZtoUTC(endDate || end);

        return {
            startDate,
            endDate
        };
    },

    convertUserTZtoUTC: function(dateTime) {
        const date = new GlideDateTime();
        date.setDisplayValue(dateTime);
        return date;
    },

    getLastXDaysDateRange: function(delayInDays = 30) {
        var gdt = this.getUserGDT();
        const endDate = gdt.getDate().getValue();
        gdt.addDaysUTC(-1 * delayInDays);
        var startDate = gdt.getDate().getValue();
        return {
            startDate: `${startDate} 00:00:00`,
            endDate: `${endDate} 23:59:59`
        };
    },

    getDateFilterObject: function(uxaDTO) {
        const dateFilterObj = {
            filterId: 'date_range',
            sysId: 'appsee.date_range',
            start: uxaDTO.getStartTime(),
            end: uxaDTO.getEndTime(),
            order: 0,
            apply_to: [
                [{
                    type: "appsee",
                    payload: {
                        UXAFilterId: "date_range",
                        appSysId: uxaDTO.getApplicationSysId(),
                        channel: uxaDTO.getChannel(),
                        filterConfigurations: [{
                            filterId: "date_range",
                            start: uxaDTO.getStartTime(),
                            end: uxaDTO.getEndTime(),
                            order: 0
                        }]
                    }
                }]
            ],
            type: 'date'
        };

        return dateFilterObj;
    },

    getEventData: function(uxaDTO, filterConfigurations = [], dataConfiguration) {
        const {
            metricField,
            predicateComposition,
            orAndStrategy,
            shortSummaryCondition,
            channel,
            events,
            pageId
        } = dataConfiguration;
        let type = uxaDTO.getType();

        if (
            type === UXAConstants.TYPE.SESSIONS &&
            metricField === UXAConstants.METRIC_FIELD.USERS
        ) {
            type = UXAConstants.TYPE.USERS;
        }

        const eventData = {
            type,
            channel,
            AppSysId: uxaDTO.getApplicationSysId(),
            applicationId: uxaDTO.getApplicationSysId(),
            filterConfigurations: JSON.parse(JSON.stringify((filterConfigurations)))
        };

        if (predicateComposition) {
            eventData.predicateComposition = predicateComposition;
            eventData.orAndStrategy = orAndStrategy;
            eventData.shortSummaryCondition = shortSummaryCondition;
        }

        if (type === UXAConstants.TYPE.PAGES) {
            eventData.value = pageId;
            eventData.title = pageId;
        }

        if (type === UXAConstants.TYPE.EVENTS) {
            eventData.value = events;
            eventData.title = events;
        }

        // add date filter for drill down
        const dateFilter = this.getDateFilterObject(uxaDTO);
        eventData.filterConfigurations.push(dateFilter);

        return eventData;
    },

    getUserGDT: function(utcGdt = new GlideDateTime()) {
        const userGdt = new GlideDateTime(utcGdt.getDisplayValueInternal());
        return userGdt;
    },

    getSessionTimezoneOffset: function(toConvert = 'mins') {
        const utcGdt = new GlideDateTime();
        const userGdt = this.getUserGDT(utcGdt);
        var offset = userGdt.getNumericValue() - utcGdt.getNumericValue(); //In milliseconds
        switch (toConvert) {
            case 'seconds':
                offset = offset / 1000;
                break;
            case 'mins':
                offset = offset / (1000 * 60);
                break;
            case 'hrs':
                offset = offset / (1000 * 60 * 60);
                break;
        }
        return Math.round(offset);
    },

    getChannel: function(appSysId) {
        let channel;
        if (appSysId) {
            const gr = new GlideRecord(UXAConstants.TABLE.ANALYTICS_APP);
            gr.addQuery(UXAConstants.APPLICATION_ID, appSysId);
            gr.query();
            if (gr.next())
                channel = gr.getDisplayValue(UXAConstants.ANALYTICS_CHANNEL);
            channel = UXAConstants.CHANNEL_ENUM[channel?.toUpperCase()]?.ID.toString();
        }
        return channel;
    },

    getAllApplications: function() {
        let applications = {};
        const gr = new GlideRecord(UXAConstants.TABLE.ANALYTICS_APP);
        gr.query();
        while (gr.next())
            applications[gr.getValue(UXAConstants.APPLICATION_ID)] = gr.getValue(UXAConstants.APPLICATION_NAME);

        return applications;
    },

    getBrowserTypeMapping: function() {
        const browserTypes = new QueryServiceAPI().getBrowserTypes();
        const browsers = {};
        browserTypes.forEach(({
            k,
            v
        }) => {
            browsers[k] = v;
        });
        return browsers;
    },

    validateFunnelSteps: function(steps) {
        let valid = true;
        steps.forEach((step, index) => {
            const alternatives = step.Alternatives;
            if (alternatives.length > 0) {
                alternatives.forEach((alternative) => {
                    if (!UXAConstants.VALID_STEP_NUMBERS.includes(alternative.StepType)) {
                        const err = {
                            statusCode: 400,
                            message: `Step Type '${UXAConstants.FUNNEL_ENUM_MAPPING[alternative.StepType]}' is not supported`
                        };
                        throw err;
                    } else if (index !== 0 && UXAConstants.VALID_FIRST_FUNNEL_STEP.includes(alternative.StepType)) {
                        const err = {
                            statusCode: 400,
                            message: `Session Type step is present other than first step`
                        };
                        throw err;
                    }
                });
            }
        });
        return valid;
    },

    validateFunnelFirstStep: function(steps, uxaDTO) {
        const isValidStepType = steps[0].Alternatives.some(alternative => {
            if (alternative.StepType === UXAConstants.SESSION_STARTED_MAPPING) { // sessionStart1st in ENUM Mapping is 4
                uxaDTO.setFunnelFlag(true);
            }
            return UXAConstants.VALID_FIRST_FUNNEL_STEP.includes(alternative.StepType);
        });

        if (isValidStepType) {
            steps.shift(); // Remove the 0th element of the array
        }

        return steps;
    },

    validateCohortSteps: function(steps) {
        let valid = true;
        steps.forEach((step, index) => {
            const alternatives = step.Alternatives;
            if (alternatives.length > 0) {
                alternatives.forEach((alternative) => {
                    if (!UXAConstants.VALID_STEP_NUMBERS.includes(alternative.StepType)) {
                        const err = {
                            statusCode: 400,
                            message: `Step Type '${UXAConstants.FUNNEL_ENUM_MAPPING[alternative.StepType]}' is not supported`
                        };
                        throw err;
                    }
                });
            }
        });
        return valid;
    },

    validateCohortFirstStep: function(steps, uxaDTO) {
        const isValidStepType = steps[0].Alternatives.some(alternative => {
            if (alternative.StepType === UXAConstants.SESSION_STARTED_MAPPING) {
                alternative.StepType = UXAConstants.SESSION_ANY_ENUM_MAPPING;
                uxaDTO.setCohortFlag(true);
            }
        });
        return steps;
    },

    formStepDescriptionForFunnels: function(alternative) {
        const stepType = alternative.StepType;
        const stepValue = alternative.Value;
        const stepProperties = alternative.ExtraValues;

        const extraValuesString = Object.entries(stepProperties)
            .map(([key, value]) => `${key}: ${value}`)
            .join(', ');
        if (stepValue && extraValuesString)
            return `${UXAConstants.FUNNEL_DESCRIPTION_MAPPING[stepType]} '${stepValue}' (${extraValuesString})`;
        else if (stepValue && !extraValuesString)
            return `${UXAConstants.FUNNEL_DESCRIPTION_MAPPING[stepType]} '${stepValue}'`;
        else
            return `${UXAConstants.FUNNEL_DESCRIPTION_MAPPING[stepType]}`

    },

    getTimestampColumn: function(uxaDTO) {
        const startTimeTypes = [UXAConstants.TYPE.SESSIONS, UXAConstants.TYPE.USERS, UXAConstants.TYPE.APPLICATION];
        if (startTimeTypes.includes(uxaDTO.getType()) || (UXAConstants.TYPE.RETENTION === uxaDTO.getType() && UXAConstants.DATA_CATEGORY.COHORT != uxaDTO.getDataCategory()))
            return UXAConstants.DATA_POINTS_COLUMNS.START_TIME;
        return UXAConstants.DATA_POINTS_COLUMNS.TIMESTAMP;
    },

    isLegacyDashboardEnabled: function() {
        //const legacyDashboardStatus = gs.getProperty("glide.uxa.legacy_dashboard.enabled");
        //return legacyDashboardStatus && legacyDashboardStatus === "true" ? true : false;
        return false;
    },

    /**
     * Returns change and changePercent for given old and new value;
     * returns changeData = {
     * change,
     * changePercent
     * }
     */
    getPercentChange: function(newValue, oldValue, decimalPoints = 2) {
        const changeData = {
            change: newValue - oldValue,
            changePercent: 0
        };
        if (changeData.change == 0)
            return changeData;

        if (oldValue == 0) {
            changeData.changePercent = 100;
            return changeData;
        }
        changeData.changePercent = ((Math.abs(changeData.change) / oldValue) * 100).toFixed(decimalPoints);
        return changeData;
    },

    //Get PageNames Map as k=name and v=desc
    getPageKeyValueMapping: function(uxaDTO) {
        let pageMap = {};
        if (!(uxaDTO && uxaDTO.getApplicationSysId() && (uxaDTO.getChannel() || uxaDTO.getChannel() == 0)))
            return pageMap;

        const params = {
            app_sys_id: uxaDTO.getApplicationSysId(),
            channel: uxaDTO.getChannel()
        };
        pageMap = new QueryServiceAPI().getPageNames(params);
        pageMap = Object.assign({}, ...pageMap.map(item => ({
            [item.k]: item.v
        })));
        return pageMap;
    },

    //This will return filter object which will be added in Simple/Group/Trend response widgets.
    getFilterObject: function(uxaDTO) {
        const appliedFilters = this._populateFilterObject(uxaDTO.getProcessedFilters().appliedFilters);
        const notAppliedFilters = this._populateFilterObject(uxaDTO.getProcessedFilters().notAppliedFilters);
        const filterObj = {
            appliedFilters,
            notAppliedFilters
        };
        return filterObj;
    },

    _populateFilterObject: function(filters = []) {
        let uniqueFilters = filters.reduce((arr, value) => {
            if (!arr.includes(value))
                arr.push(value);
            return arr;
        }, []);

        return uniqueFilters.map(order => ({
            order
        }));
    },

    generateErrorObject: function(err) {
        const serviceError = new sn_ws_err.ServiceError();
        let message;
        if (err && err.statusCode && err.message) {
            serviceError.setStatus(err.statusCode);
            message = `Error Details: ${err.message}`;
            serviceError.setDetail(err?.detail);
        } else {
            message = `Unexpected error occurred. Error Details: ${err}`;
            serviceError.setStatus(500);
        }
        serviceError.setMessage(message);
        return serviceError;
    },

    getUserDateTime: function(timestamp) {
        if (timestamp)
            return (new GlideDateTime(timestamp)).getDisplayValueInternal();
        return (new GlideDateTime()).getDisplayValueInternal();
    },

    // This method converts the system dateTime format to user's format
    // Eg: yyyy-MM-dd HH:mm:ss (System format) -> MMM-dd-yyyy (User format)
    convertUserDateTimeFormat: function(dateTime) {
        if (!dateTime)
            return '';

        const gdt = new GlideDateTime();
        gdt.setDisplayValueInternal(dateTime);

        return gdt.getDisplayValue();
    },

    getDatatableUIFields: function(type, channel, uxaDTO, column = '') {
        const dataTableUIFieldMapping = {
            EVENTS: {
                NAME: {
                    'uiType': 'link',
                    'uiLabel': gs.getMessage('Name')
                },
                DESCRIPTION: {
                    'uiLabel': gs.getMessage('Description'),
                    'disableSorting': true
                },
                OCCURRENCES: {
                    'uiLabel': gs.getMessage('Total occurrences'),
                    'uiType': 'number'
                },
                CHANGE_PERCENT: {
                    'uiLabel': gs.getMessage('Change %')
                },
                ACTIVE_USERS: {
                    'uiLabel': gs.getMessage('Active users')
                },
                DISPLAY_NAME: {
                    'uiLabel': gs.getMessage('Display name'),
                    'disableSorting': true
                },
                EVENT_TYPE: {
                    'uiLabel': gs.getMessage('Event type'),
                    'disableSorting': true,
                    'uiType': 'highlightedValue'
                }

            },
            PAGES: {
                NAME: {
                    'uiType': 'link',
                    'uiLabel': gs.getMessage('Name'),
                    disableSorting: true,
                },
                VIEWS: {
                    'uiLabel': gs.getMessage('Views')
                },
                SESSIONS: {
                    'uiLabel': gs.getMessage('Sessions')
                },
                PERCENT_OF_SESSIONS: {
                    'uiLabel': gs.getMessage('% of sessions'),
                    'uiFormat': 'percentage'
                },
                AVERAGE_VIEW_TIME: {
                    'uiLabel': gs.getMessage('Avg view time'),
                    'uiFormat': 'duration',
                    'disableSorting': true,
                },
                ACTIVE_USERS: {
                    'uiLabel': gs.getMessage('Active users'),
                    'disableSorting': true,
                    'uiFormat': 'number'
                }
            },
            USERS: {
                USER_INDEX: {
                    'uiType': 'link',
                    'uiLabel': gs.getMessage('User ID')
                },
                HASHED_USER_ID: {
                    'uiLabel': gs.getMessage('Hashed user id'),
                    'maxCharacters': 20,
                    'mandatory': true
                },
                SESSIONS: {
                    'uiLabel': gs.getMessage('Sessions')
                },
                FIRST_SESSION: {
                    'uiLabel': gs.getMessage('First session'),
                    'uiType': 'date'
                },
                LAST_SESSION: {
                    'uiLabel': gs.getMessage('Last session'),
                    'uiType': 'date'
                },
                AVERAGE_SESSION_DURATION: {
                    'uiLabel': uxaDTO.getIsExport() ? gs.getMessage('Avg session duration in sec') : gs.getMessage('Avg session duration'),
                    'uiFormat': 'duration'
                },
                BROWSERS: {
                    'uiLabel': gs.getMessage('Devices'),
                    'disableSorting': true
                },
                LAST_LOCATION: {
                    'uiLabel': gs.getMessage('Locations'),
                    'disableSorting': true
                }
            },
            SESSIONS: {
                SESSION_DATE: {
                    'uiLabel': gs.getMessage('Date'),
                    'uiType': 'date'
                },
                SESSION_DURATION: {
                    'uiLabel': uxaDTO.getIsExport() ? gs.getMessage('Duration in sec') : gs.getMessage('Duration'),
                    'uiFormat': 'duration'
                },
                USER_INDEX: {
                    'uiType': 'link',
                    'uiLabel': gs.getMessage('User ID')
                },
                HASHED_USER_ID: {
                    'uiLabel': gs.getMessage('Hashed user id'),
                    'maxCharacters': 20,
                    'mandatory': true
                },
                BROWSER: {
                    'uiLabel': gs.getMessage('Device')
                },
                LAST_LOCATION: {
                    'uiLabel': gs.getMessage('Location')
                },
                NUMBER_OF_PAGES: {
                    'uiLabel': gs.getMessage('Pages'),
                    'uiLabelMobile': gs.getMessage('Screens')
                },
                NUMBER_OF_EVENTS: {
                    'uiLabel': gs.getMessage('Events')
                },
                SESSION_ID: {
                    'uiLabel': gs.getMessage('Session id')
                },
                SYSTEM_LOCALE: {
                    'uiLabel': gs.getMessage('Locale')
                },
                BROWSER_TYPE: {
                    'uiLabel': gs.getMessage('Browser Type'),
                    'uiType': 'LowCardinality(String)',
                    'uiFormat': 'string'
                },
                OS: {
                    'uiLabel': gs.getMessage('Operating system')
                },
                APP_VERSION: {
                    'uiLabel': gs.getMessage('App version')
                },
                OS_VERSION: {
                    'uiLabel': gs.getMessage('OS version')
                },
                BROWSER_VERSION: {
                    'uiLabel': gs.getMessage('Browser version')
                },
                APP_VERSION: {
                    'uiLabel': gs.getMessage('App version')
                },
                COUNTRY: {
                    'uiLabel': gs.getMessage('Country')
                },
                REGION: {
                    'uiLabel': gs.getMessage('State')
                },
                CITY: {
                    'uiLabel': gs.getMessage('City')
                },
                DEVICE_CODE: {
                    'uiLabel': gs.getMessage('Device Code')
                },
                SESSIONS: {
                    'uiLabel': gs.getMessage('Sessions')
                },
                DEVICE: {
                    'uiLabel': gs.getMessage('Device')
                }
            },
            APPLICATION: {
                NAME: {
                    'uiType': 'link',
                    'uiLabel': gs.getMessage('Application')
                },
                CHANNEL: {
                    'uiLabel': gs.getMessage('Channel'),
                    'mandatory': true
                },
                ACTIVE_USERS: {
                    'uiLabel': gs.getMessage('Active users')
                },
                SESSIONS: {
                    'uiLabel': gs.getMessage('Sessions')
                },
                AVERAGE_SESSION_DURATION: {
                    'uiLabel': uxaDTO.getIsExport() ? gs.getMessage('Avg session duration in sec') : gs.getMessage('Avg session duration'),
                    'uiFormat': 'duration',
                },
                AVERAGE_SESSIONS_PER_USER: {
                    'uiLabel': gs.getMessage('Avg sessions per user')
                }
            },
            EVENT_EXPORT: {
                NAME: {
                    uiLabel: gs.getMessage('Name')
                },
                CHANNEL: {
                    uiLabel: gs.getMessage('Platform')
                },
                SESSION_ID: {
                    uiLabel: gs.getMessage('Session id'),
                },
                HASHED_USER_ID: {
                    uiLabel: gs.getMessage('Hashed user id'),
                },
                COUNTRY: {
                    uiLabel: gs.getMessage('Country'),
                },
                SESSION_START_TIME: {
                    uiLabel: gs.getMessage('Session start time')
                },
                EVENT_TIME: {
                    uiLabel: gs.getMessage('Event time')
                }
            }
        };

        if (type === 'USERS') {
            const queryServiceApi = new QueryServiceAPI();
            const customProperties = queryServiceApi.getCustomUserProperties();

            customProperties.forEach(({
                k,
                v
            }) => {
                dataTableUIFieldMapping.USERS[k.replace(/\./g, '__')] = {
                    'uiLabel': v
                };
            });
        }

        if (column)
            return dataTableUIFieldMapping[type]?.[column];
        return dataTableUIFieldMapping[type];
    },

    getUserPrefsColumns: function(userPrefsColumnsKey) {
        try {
            return JSON.parse(gs.getUser().getPreference(userPrefsColumnsKey) || "[]");
        } catch (e) {
            return [];
        }
    },

    generateCacheKey: function(requestBody) {
        const request = JSON.parse(requestBody);
        const filterAttributes = UXAConstants.CACHE_KEY_FILTER_ATRBS;
        const dataAttributes = UXAConstants.CACHE_KEY_DATA_ATRBS;

        // Helper function to check if a value is empty (string, array, or object)
        function isEmpty(value) {
            return (
                (typeof value === "string" && value.trim() === "") ||
                (Array.isArray(value) && value.length === 0) ||
                (typeof value === "object" && value !== null && Object.keys(value).length === 0)
            );
        }

        // Helper function to convert field values to string and filter out empty values
        function convertValue(value) {
            if (Array.isArray(value))
                return value.join(","); // Convert array to comma-separated string
            else if (typeof value === "object" && value !== null)
                return JSON.stringify(value); // Convert object to JSON string

            return value; //number, string
        }

        function extractAttributes(configArray, attributes) {
            return configArray
                .map(config =>
                    attributes
                    .map(attr => {
                        if (attr == 'predicateComposition')
                            return `${convertValue(config[attr]?.predicate) || ''}`;
                        return `${convertValue(config[attr]) || ''}`;
                    })
                    .join("|")
                )
                .filter(Boolean) // Remove empty strings
                .join("|");

        }
        // Generate keys from data and filter configurations
        const dataConfigKey = extractAttributes(request.dataConfigurations, dataAttributes);

        //Update filterConfig dynamic
        request.filterConfigurations?.forEach((filter, index) => {
            if (UXAConstants.UXA_FILTER_TYPE.DATE == filter.type?.toLowerCase()) {
                const dates = this.getDateRange([filter]);
                filter.start = dates.startDate;
                filter.end = dates.endDate;
            }
        });
        const filterConfigKey = extractAttributes(request.filterConfigurations, filterAttributes);

        return `${dataConfigKey}|${filterConfigKey}`;
    },

    isObjectArray: function(arr) {
        let isObjectArr = false;
        if (Array.isArray(arr))
            isObjectArr = arr.every(item => typeof item === "object" && !Array.isArray(item) && item !== null);
        return isObjectArr;
    },
    _getFilterIdMap: function(filterId, type) {
        return (
                UXAConstants.FILTER_ID_DSL_MAP[type] &&
                UXAConstants.FILTER_ID_DSL_MAP[type][filterId]
            ) ||
            (
                UXAConstants.FILTER_ID_DSL_MAP &&
                UXAConstants.FILTER_ID_DSL_MAP[filterId]
            ) || filterId;
    },
    _checkFilterValidityForChannel(filterId, channel) {
        if (channel === '0' && UXAConstants.EXCLUDED_FILTERS_FOR_MOBILE.includes(filterId))
            return;
        else if (channel !== '0' && UXAConstants.EXCLUDED_FILTERS_FOR_WEB.includes(filterId))
            return;
        return filterId;
    },
    transformValidFilter: function(applyToObject, availableUserProperties, uxaDTO) {
        if (typeof applyToObject === UXAConstants.DATA_TYPES.STRING) {

            // Handle string cases with Appsee filters
            if (applyToObject.startsWith(UXAConstants.APPSEE)) {
                return this._checkFilterValidityForChannel(this._getFilterIdMap(applyToObject, uxaDTO.getType()), uxaDTO);
            }

            // Check if the filter is from the sys_user table
            if (applyToObject.includes("sys_user.")) {
                const userProperty = availableUserProperties.find(existingUserProperty =>
                    existingUserProperty?.k.includes(applyToObject)
                );
                if (userProperty) {
                    return this._getFilterIdMap(userProperty.k, uxaDTO.getType());
                }
                return false;
            }

            // Handle other properties from non sys_user tables
            const userProperty = availableUserProperties.find(existingUserProperty =>
                existingUserProperty?.metadata?.table === applyToObject.split(".")[0]
            );
            if (userProperty) {
                return this._getFilterIdMap(userProperty.k, uxaDTO.getType());
            }
            return false;
        }

        // If it's an Appsee data source, return the filter id
        if (applyToObject?.type?.toLowerCase() === UXAConstants.APPSEE) {
            return this._checkFilterValidityForChannel(
                this._getFilterIdMap(applyToObject.payload?.UXAFilterId, uxaDTO.getType()),
                uxaDTO
            );
        }

        // If it's not from Appsee, exclude the filter
        if (applyToObject?.type?.toLowerCase() !== UXAConstants.APPSEE) {
            return false;
        }

        // Unknown type
        return false;
    },

    getAverage: function(numerator, denominator) {
        // Default undefined or null values to 0
        numerator = (numerator !== undefined && numerator !== null) ? numerator : 0;
        denominator = (denominator !== undefined && denominator !== null) ? denominator : 0;
        return denominator === 0 ? 0 : numerator / denominator;
    },

    getReferenceTable: function(table, referenceField) {
        //Check if the type of the reference Field is reference and then get its respective table name
        const gr = new GlideRecord(table);
        if (gr.isValidField(referenceField)) {
            var ed = gr.getElement(referenceField);
            if (ed.getED().getInternalType() === UXAConstants.REFERENCE) {
                return ed.getED().getReference();
            }
        }
    },

    getReferenceFieldDetailsForUserProperties: function(userPropertiesColumns) {
        const userPropertiesWithReferenceFieldDetails = [];
        userPropertiesColumns.forEach(userProperty => {
            const {
                idx,
                property
            } = userProperty;

            //Example of user property StringUserProperties__sys_user__department in backend response columns
            const [type, table, referenceField] = property.split("__");

            const referenceTable = this.getReferenceTable(table, referenceField);
            if (referenceTable) {
                userPropertiesWithReferenceFieldDetails.push({
                    idx,
                    property,
                    referenceField,
                    referenceTable
                });
            }

        });
        return userPropertiesWithReferenceFieldDetails;
    },

    getDisplayValueForUserProperties: function(userPropertiesWithReferenceFieldDetails, resRows, batchSize = 2000) {
        //Create a map to hold as {key = referenceField, value = {sysId, displayValue}
        const userPropertiesWithDisplayValues = [];

        userPropertiesWithReferenceFieldDetails.forEach(userPropertiesWithReferenceFieldDetail => {
            const {
                idx,
                property,
                referenceField,
                referenceTable
            } = userPropertiesWithReferenceFieldDetail;

            const sysIds = resRows.map(resRow => resRow[idx]); //get the sys_id based on index
            userPropertiesWithDisplayValues[referenceField] = {};
            for (var i = 0; i < sysIds.length; i += batchSize) {
                var batch = sysIds.slice(i, i + batchSize); // Get a batch of sys_ids
                var gr = new GlideRecord(referenceTable);
                gr.addQuery(UXAConstants.SYS_ID, "IN", batch);
                gr.query();

                while (gr.next()) {
                    userPropertiesWithDisplayValues[referenceField][gr.sys_id] = gr.getDisplayValue();
                }
            }

        });

        return userPropertiesWithDisplayValues;
    },

    //Check if resColumns contains the group with UserProperties:
    getUserPropertyColumns: function(resColumns) {
        const userPropertiesColumns = [];
        resColumns.forEach((element, idx) => {
            if (element[0].includes('UserProperties')) {
                userPropertiesColumns.push({
                    idx,
                    property: element[0]
                });
            }
        });
        return userPropertiesColumns;
    },

    getUserPropsReferenceFieldsData: function(userPropertiesColumns, resRows) {
        //User Properties may contain the reference columns, for example: StringUserProperties.sys_user.department -> Field type of the department is reference. So resolve the actual tables names for such reference fields.
        const userPropertiesWithReferenceFieldDetails = this.getReferenceFieldDetailsForUserProperties(userPropertiesColumns);

        //For each user property which is of reference types, fetch the display value for reference column.
        return this.getDisplayValueForUserProperties(userPropertiesWithReferenceFieldDetails, resRows);
    },

    _getUserDetails: function(hashedUserIds, userPropColumns) {
        const userCache = {};
        const gr = new GlideRecord('sys_user');

        gr.addQuery(UXAConstants.HASHED_USER_ID, 'IN', hashedUserIds);
        gr.query();

        while (gr.next()) {
            const hashedUserId = gr.getValue(UXAConstants.HASHED_USER_ID);
            userCache[hashedUserId] = {};

            userPropColumns.forEach(({
                field
            }) => {
                const [, tableName, referenceField] = field.split('__');
                userCache[hashedUserId][referenceField] = gr.getDisplayValue(referenceField);
            });
        }

        return userCache;
    },

    getPageDisplayNames: function(applicationId, channel, pageNames) {
        const params = {
            app_sys_id: applicationId,
            channel: channel,
        };
        if (pageNames?.length > 0) {
            params.page_names = pageNames;
        }

        const pageDisplayNames = new QueryServiceAPI().getPageNames(params);
        return Object.assign({}, ...pageDisplayNames.map(item => ({
            [item.k]: item.v
        })));
    },

    normalizeTableNames: function(tableName) {
        let value = tableName;
        // Remove known prefixes
        value = value.replace(/^(record-|sub-list-)/, '');
        // Remove trailing _list
        value = value.replace(/_list$/, '');
        return value;
    },

    hasValidTablePageName: function(tableName) {
        const hasPrefix = /^(record-|sub-list-)/.test(tableName);
        const hasSuffix = /_list$/.test(tableName);
        return hasPrefix || hasSuffix;
    },

    convertTableToPageNames: function(tableName) {
        return [`record-${tableName}`, `sub-list-${tableName}`, `${tableName}_list`];
    },

    getEventGrData: function(gr) {
        const data = {};
        Object.values(UXAConstants.EVENT_REPOSITORY_TABLE_COLUMNS).forEach(columnName => {
            data[columnName] = gr.getValue(columnName);
        });
        data.eventTypeDisplayValue = gr.getDisplayValue(UXAConstants.EVENT_REPOSITORY_TABLE_COLUMNS.EVENT_TYPE);

        return data;
    },

    getMergedResponseForEvents: function(response, rows, columns, uxaDTO) {
        try {
            const applicationId = uxaDTO.getApplicationSysId();
            const pageId = uxaDTO.getPageId();
            const uiFields = this.getDatatableUIFields(uxaDTO.getType().toUpperCase(), uxaDTO.getChannel(), uxaDTO);
            var selectedColumns = uxaDTO.getSelectedColumns();

            // Process columns first to ensure all needed columns exist
            if (selectedColumns && selectedColumns.length > 0) {
                selectedColumns.forEach(function(columnName) {
                    var columnExists = false;
                    for (var i = 0; i < columns.length; i++) {
                        if (columns[i].key === columnName) {
                            columnExists = true;
                            break;
                        }
                    }

                    // If column doesn't exist, add it
                    if (!columnExists) {
                        var columnObj = {};
                        columnObj.key = columnName;
                        columnObj.label = columnName; // Default label is column name
                        columnObj.type = UXAConstants.COLUMN_TYPE_MAPPING[UXAConstants.DEFAULT_FIELD_TYPE];

                        var uiElement = uiFields && uiFields[columnName];
                        if (uiElement) {
                            columnObj.type = uiElement.uiType;
                            columnObj.label = uiElement.uiLabel || columnName;
                            columnObj.format = uiElement.uiFormat || columnObj.format;
                            if (uiElement.maxCharacters) {
                                columnObj.maxCharacters = uiElement.maxCharacters;
                            }
                            if (uiElement.disableSorting) {
                                columnObj.headerTextDisabled = true;
                            }
                            if (uiElement.mandatory) {
                                columnObj.mandatory = true;
                            }
                        }

                        columns.push(columnObj);
                    }
                });
            }

            if (uxaDTO.getVisuallyTaggedId() && rows.length === 0) {
                const visuallyTaggedId = uxaDTO.getVisuallyTaggedId();
                rows.push({
                    NAME: {
                        value: visuallyTaggedId,
                        key: visuallyTaggedId,
                        label: visuallyTaggedId
                    }
                });
            }


            let finalRows = this.updateRowsBasedonColumns(rows, columns);
            if (uxaDTO.getComponentInstance() === UXAConstants.TAGGED_EVENTS)
                finalRows = this.mergeTaggedEventsRows(rows, columns, applicationId, pageId);
            const columnsToExclude = [UXAConstants.DISPLAY_NAME, UXAConstants.APPSEE_EVENT_TYPE];
            columns = columns.filter(item => !columnsToExclude.includes(item.key));
            columns.forEach(col => {
                if (col.key === UXAConstants.EVENT_NAME) {
                    col.headerTextDisabled = true;
                }
            });
            return {
                columns: columns,
                rows: finalRows
            };
        } catch (e) {
            gs.error('Error in getMergedResponseForEvents: ' + e);
            return {
                columns: columns,
                rows: rows
            };
        }
    },

    updateRowsBasedonColumns: function(rows, columns) {

        const eventNames = [];
        for (const row of rows ?? []) {
            const eventName = row?.NAME?.value;
            if (eventName) {
                eventNames.push(eventName);
            }
        }

        // If no event names found, return the original rows
        if ((eventNames?.length ?? 0) === 0) {
            return rows;
        }

        // Create a map to store event data from the database
        const eventData = {};

        // Query the database once for all events
        const eventGR = new GlideRecord(UXAConstants.TABLE.EVENT_REPOSITORY);
        eventGR.addQuery(UXAConstants.EVENT_ID, 'IN', eventNames.join(','));
        eventGR.query();

        // Store event data from the database
        const repoCols = UXAConstants?.EVENT_REPOSITORY_TABLE_COLUMNS ?? {};
        while (eventGR.next()) {
            const eventId = eventGR.getValue(UXAConstants.EVENT_ID);
            if (eventId) {
                eventData[eventId] = {};
                for (const [columnKey, dbField] of Object.entries(repoCols)) {
                    if (dbField) {
                        eventData[eventId][columnKey] = eventGR.getValue(dbField) ?? '';
                        eventData[eventId][`${columnKey}_display_value`] = eventGR.getDisplayValue(dbField) ?? '';
                    }
                }
                eventData[eventId].metadata = this.getEventGrData(eventGR);
            }
        }

        // Update rows with data from the database
        for (const row of rows ?? []) {
            const eventName = row?.NAME?.value ?? '';

            // Process each column
            for (const col of columns ?? []) {
                const columnKey = col?.key;
                if (!columnKey || columnKey === UXAConstants.DISPLAY_NAME) continue;

                // Initialize column if it doesn't exist
                if (!row?.[columnKey]) {
                    row[columnKey] = {
                        value: '',
                        key: ''
                    };
                }

                // If we have data for this event, use it
                if (eventName && eventData?.[eventName]?.[columnKey] !== undefined) {
                    const value = eventData[eventName][columnKey];
                    const displayValue = eventData[eventName][`${columnKey}_display_value`];
                    if (columnKey === UXAConstants.EVENT_NAME) {
                        row[columnKey].label = eventData[eventName][UXAConstants.DISPLAY_NAME];
                    } else if (columnKey === UXAConstants.EVENT_TYPE) {
                        // Hide "Default" event type - render as blank
                        if (value === 'default' || displayValue?.toLowerCase() === 'default') {
                            row[columnKey].value = '';
                            row[columnKey].key = '';
                            row[columnKey].label = '';
                        } else {
                            row[columnKey].value = displayValue;
                            row[columnKey].key = value;
                            row[columnKey].label = displayValue;
                            // Add highlightedValue if column has uiType: 'highlightedValue'
                            if (col.type === 'highlightedValue') {
                                row[columnKey].highlightedValue = {
                                    color: this.getEventTypeColor(value),
                                    value: displayValue,
                                    size: 'sm'
                                };
                            }
                        }
                    } else {
                        row[columnKey].value = value;
                        row[columnKey].key = value;
                    }
                    row.metadata = eventData[eventName].metadata;
                }
            }
            // for visually tagged events which are deleted in glide
            if (eventName && !eventData?.[eventName] && row?.[UXAConstants.APPSEE_EVENT_TYPE]?.value === UXAConstants.VISUALLY_TAGGED) {
                if (!row.metadata) {
                    row.metadata = {};
                }
                row.metadata.isRetired = true;
                if (row[UXAConstants.EVENT_TYPE]) {
                    row[UXAConstants.EVENT_TYPE].value = gs.getMessage('Retired');
                    row[UXAConstants.EVENT_TYPE].key = 'retired';
                    // Add highlightedValue for retired events
                    const eventTypeCol = columns.find(c => c.key === UXAConstants.EVENT_TYPE);
                    if (eventTypeCol && eventTypeCol.type === 'highlightedValue') {
                        row[UXAConstants.EVENT_TYPE].highlightedValue = {
                            color: this.getEventTypeColor('retired'),
                            value: gs.getMessage('Retired'),
                            size: 'sm'
                        };
                    }
                }
            }
        }

        return rows;
    },


    mergeTaggedEventsRows: function(rows, columns, applicationId, pageId) {
        // Query events from the database filtered by application ID and page ID
        var eventGR = new GlideRecord(UXAConstants.TABLE.EVENT_REPOSITORY);
        if (applicationId) {
            eventGR.addQuery(UXAConstants.APP_ID, applicationId);
        }
        if (pageId) {
            eventGR.addQuery(UXAConstants.PAGE_ID, pageId);
        }
        eventGR.addQuery(UXAConstants.EVENT_REPOSITORY_TABLE_COLUMNS.EVENT_TYPE, 'IN', ['visually_tagged', 'oob_tagged']);
        eventGR.query();

        // Build a map of events that exist in the database and store their data
        var dbEvents = {};
        var dbEventRecords = [];
        while (eventGR.next()) {
            var eventId = eventGR.getValue(UXAConstants.EVENT_ID);
            dbEvents[eventId] = true;

            // Store the event data for later use
            var eventData = {};
            for (var j = 0; j < columns.length; j++) {
                var column = columns[j];
                var columnKey = column.key;

                if (UXAConstants.EVENT_REPOSITORY_TABLE_COLUMNS[columnKey]) {
                    var dbField = UXAConstants.EVENT_REPOSITORY_TABLE_COLUMNS[columnKey];
                    eventData[columnKey] = eventGR.getValue(dbField) || "";
                    eventData[columnKey + "_displayValue"] = eventGR.getDisplayValue(dbField) || "";
                }
            }
            eventData.metadata = this.getEventGrData(eventGR);
            eventData.eventId = eventId;
            eventData.displayName = eventGR.getValue(UXAConstants.EVENT_REPOSITORY_TABLE_COLUMNS.DISPLAY_NAME);

            dbEventRecords.push(eventData);
        }

        // Filter input rows to keep only those that exist in the database
        var filteredRows = [];
        var existingEvents = {};
        for (var i = 0; i < rows.length; i++) {
            var eventName = rows[i].NAME && rows[i].NAME.value;
            if (eventName && dbEvents[eventName]) {
                filteredRows.push(rows[i]);
                existingEvents[eventName] = true;
            }
        }

        // Add missing events from the stored database records
        for (var k = 0; k < dbEventRecords.length; k++) {
            var eventRecord = dbEventRecords[k];
            var eventId = eventRecord.eventId;

            // Skip if this event already exists in the filtered rows
            if (existingEvents[eventId]) {
                continue;
            }

            // Create a new row for this event
            var newRow = {};

            // Add each column to the new row based on column definition
            for (var j = 0; j < columns.length; j++) {
                var column = columns[j];
                var columnKey = column.key;
                var value;
                var key;

                if (UXAConstants.EVENT_REPOSITORY_TABLE_COLUMNS[columnKey]) {
                    value = eventRecord[columnKey] || "";
                    key = eventRecord[columnKey] || "";
                } else {
                    if (column.type === 'number') {
                        value = "0.00";
                        key = 0;
                    } else {
                        value = "";
                        key = "";
                    }
                }
                if (columnKey === 'NAME') {
                    newRow[columnKey] = {
                        value: value,
                        key: key,
                        label: eventRecord.displayName
                    };
                } else if (columnKey === 'EVENT_TYPE') {
                    newRow[columnKey] = {
                        value: value,
                        key: key,
                        label: eventRecord[columnKey + "_displayValue"] || value
                    };
                    // Add highlightedValue if column has uiType: 'highlightedValue'
                    if (column.type === 'highlightedValue') {
                        newRow[columnKey].highlightedValue = {
                            color: this.getEventTypeColor(key),
                            value: eventRecord[columnKey + "_displayValue"] || value,
                            size: 'sm'
                        };
                    }
                } else {
                    newRow[columnKey] = {
                        value: value,
                        key: key,
                        label: eventRecord[columnKey + "_displayValue"] || value
                    };
                }
            }
            newRow.metadata = eventRecord.metadata;

            // Add the new row to the filtered rows array
            filteredRows.push(newRow);
        }

        return filteredRows;
    },

    type: 'UXAUtils'
};
