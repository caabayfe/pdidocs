var UXAVizService = Class.create();
UXAVizService.prototype = {
    initialize: function(uxaDTO) {
        this.utils = new UXAUtils();
        this.uxaBaseService = new UXABaseService(uxaDTO);
    },

    processDARequest: function(uxaDTO) {
        let transformedResponse = {};
        switch (uxaDTO.getDataCategory()) {
            case UXAConstants.DATA_CATEGORY.FLAT:
            case UXAConstants.DATA_CATEGORY.SIMPLE:
            case UXAConstants.DATA_CATEGORY.TIMESTAMP:
                transformedResponse = this.processSimpleRequest(uxaDTO);
                break;
            case UXAConstants.DATA_CATEGORY.GROUP:
                transformedResponse = this.processGroupRequest(uxaDTO);
                break;
            case UXAConstants.DATA_CATEGORY.TREND:
                transformedResponse = this.processTrendRequest(uxaDTO);
                break;
            case UXAConstants.DATA_CATEGORY.DATATABLE:
                transformedResponse = this.processDataTableRequest(uxaDTO);
                break;
            case UXAConstants.DATA_CATEGORY.METADATA:
                transformedResponse = this.processMetadataRequest(uxaDTO);
                break;
            case UXAConstants.DATA_CATEGORY.ACTIVITY_TIMELINE:
                transformedResponse = this.processActivityTimelineRequest(uxaDTO);
                break;
            case UXAConstants.DATA_CATEGORY.COHORT:
                transformedResponse = this.processRetentionRequest(uxaDTO);
                break;
            default:
                transformedResponse = this.processSimpleRequest(uxaDTO);
                break;
        }
        return transformedResponse;
    },

    processQueryRequest: function(uxaDTO) {
        return this.processDARequest(uxaDTO);
    },

    processMetadataRequest: function(uxaDTO) {
        const transformedResponse = this.uxaBaseService.getMetadata(uxaDTO);
        return transformedResponse;
    },

    processActivityTimelineRequest: function(uxaDTO) {
        const data = this.uxaBaseService.getActivityTimelineData(uxaDTO);
        const pageMap = this.utils.getPageKeyValueMapping(uxaDTO);
        data.forEach(row => {
            if (row.DataPointType === 'Page')
                row.Name = pageMap[row.Name] || row.Name;
            if (row.Timestamp)
                row.Timestamp = this.utils.getUserDateTime(row.Timestamp);
        });
        return data;
    },

    processRetentionRequest: function(uxaDTO) {

        const retentionData = this.uxaBaseService.getRetentionData(uxaDTO);

        if ([UXAConstants.METRIC_FIELD.RETENTION.NEVER_RETURNED_COUNT,
                UXAConstants.METRIC_FIELD.RETENTION.RETURNED_AFTER_TIME_COUNT,
                UXAConstants.METRIC_FIELD.RETENTION.SESSION_FREQUENCY
            ].includes(uxaDTO.getMetricField())) {

            //Get New User Count to calculate %age
            const originalType = uxaDTO.getType();
            const originalDataCategory = uxaDTO.getDataCategory();
            const originalMetricField = uxaDTO.getMetricField();
            const originalTypeDiv = uxaDTO.getTypeDivision();

            uxaDTO.setType(UXAConstants.TYPE.SESSIONS);
            uxaDTO.setDataCategory(UXAConstants.DATA_CATEGORY.SIMPLE);
            uxaDTO.setMetricField(UXAConstants.METRIC_FIELD.USERS);
            uxaDTO.setTypeDivision(UXAConstants.USER_TYPE.NEW);
            new UXAUIAdaptor().setFilterAttributes(uxaDTO.getFilterConfigurations(), uxaDTO);

            const scoreData = this.uxaBaseService.getData(uxaDTO);
            const newUsers = scoreData.rows?.[0]?.[0] || 0;

            uxaDTO.setType(originalType);
            uxaDTO.setDataCategory(originalDataCategory);
            uxaDTO.setMetricField(originalMetricField);
            uxaDTO.setTypeDivision(originalTypeDiv);

            switch (uxaDTO.getMetricField()) {
                case UXAConstants.METRIC_FIELD.RETENTION.NEVER_RETURNED_COUNT:
                case UXAConstants.METRIC_FIELD.RETENTION.RETURNED_AFTER_TIME_COUNT:
                    if (retentionData.rows?.[0]?.[0])
                        retentionData.rows[0][0] = newUsers ? ((retentionData.rows[0][0] * 100) / newUsers).toFixed(2) : 0;
                    break;
                case UXAConstants.METRIC_FIELD.RETENTION.SESSION_FREQUENCY:
                    retentionData.rows.map(row => {
                        if (row.length > 1)
                            row[1] = newUsers ? (row[1] * 100) / newUsers : 0;
                        return row;
                    });
                    break;
            }
        } else if (UXAConstants.METRIC_FIELD.RETENTION.AVG_TIME_BETWEEN_SESSIONS === uxaDTO.getMetricField() && UXAConstants.DATA_CATEGORY.SIMPLE === uxaDTO.getDataCategory()) {
            //Update AvgTimeBetweenSessions scores to simple type from group type response.
            retentionData.rows = retentionData.rows.map(row => {
                const updatedRow = [];
                if (row.length > 1) {
                    updatedRow.push(row[1]);
                    return updatedRow;
                }
            });
        }
        return retentionData;
    },

    processDataTableRequest: function(uxaDTO) {
        const data = this.uxaBaseService.getData(uxaDTO);

        if (UXAConstants.METRIC.TABLE == uxaDTO.getMetric()) {
            if (UXAConstants.TYPE.PAGES == uxaDTO.getType())
                this._addSessionPercent(data, uxaDTO);
        }
        let transformedResponse = this.uxaBaseService.getTransformedData(uxaDTO, data);
        return transformedResponse;
    },

    processGroupRequest: function(uxaDTO) {
        let groupData = {};

        if (uxaDTO.getType() === UXAConstants.TYPE.RETENTION) {
            groupData = this.processRetentionRequest(uxaDTO);
        } else if ([UXAConstants.METRIC.PAGE_NAV.BAR_METRIC_NEXT_PAGE, UXAConstants.METRIC.PAGE_NAV.BAR_METRIC_PREVIOUS_PAGE].includes(uxaDTO.getMetric())) {
            let pageNavData = this.uxaBaseService.getSinglePageNavData(uxaDTO);
            if (UXAConstants.METRIC.PAGE_NAV.BAR_METRIC_NEXT_PAGE === uxaDTO.getMetric())
                pageNavData = pageNavData.next;
            else
                pageNavData = pageNavData.prev;

            const pageMap = this.utils.getPageKeyValueMapping(uxaDTO);
            /**
             * Columns:[["desc"],["name"],["count"],["rate"]] update to Columns : [["name"]]
             * Rows:[["desc" || "name"],[rate]]
             * */
            groupData.columns = [pageNavData.columns[1]];
            //const rows = [];
            groupData.rows = pageNavData.rows.map(row => {
                const updatedRow = [];
                updatedRow.push(row[1] ? (pageMap[row[1]] || row[0] || row[1]) : row[0]);
                updatedRow.push(row[3] * 100);
                return updatedRow;
            });
        } else {
            //Get top Groups
            groupData = this.uxaBaseService.getData(uxaDTO);
        }
        const transformedResponse = this.uxaBaseService.getTransformedData(uxaDTO, groupData);
        return transformedResponse;
    },

    processTrendRequest: function(uxaDTO) {
        const transformedResponse = this.uxaBaseService.getTransformedData(uxaDTO);
        return transformedResponse;
    },

    processSimpleRequest: function(uxaDTO) {
        let scoreData;
        let externalResponse = {};
        if (uxaDTO.getType() === UXAConstants.TYPE.RETENTION) {
            scoreData = this.processRetentionRequest(uxaDTO);
        } else if (uxaDTO.getMetric() === UXAConstants.METRIC.AVERAGE && uxaDTO.getMetricField() === UXAConstants.METRIC_FIELD.SESSIONS_PER_USER) {
            uxaDTO.setMetric(UXAConstants.METRIC.COUNT);
            uxaDTO.setMetricField('');
            const sessionCount = this.uxaBaseService.getData(uxaDTO);
            uxaDTO.setMetricField('users');
            const usersCount = this.uxaBaseService.getData(uxaDTO);

            const sessions = sessionCount.rows?.[0]?.[0] || 0;
            const users = usersCount.rows?.[0]?.[0] || 0;
            const sessionsPerUser = users ? sessions / users : 0;

            if (sessionCount.rows?.[0]?.[0])
                sessionCount.rows[0][0] = sessionsPerUser;

            scoreData = sessionCount;
        } else if (uxaDTO.getMetric() === UXAConstants.METRIC.AVERAGE && uxaDTO.getMetricField() === UXAConstants.METRIC_FIELD.TIME_ON_APP) {
            const originalMetricField = uxaDTO.getMetricField();
            const originalMetric = uxaDTO.getMetric();
            uxaDTO.setMetric(UXAConstants.METRIC.SUM);
            uxaDTO.setMetricField(UXAConstants.METRIC_FIELD.DURATION);
            const pageDurationSum = this.uxaBaseService.getData(uxaDTO);

            const actualPageSum = pageDurationSum.rows?.[0]?.[0] || 0;

            if (actualPageSum) {
                //Remove the page name from the filter
                const filteredFilters = uxaDTO.getFilters().filter(filter => !filter.hasOwnProperty("Name"));
                uxaDTO.setFilters(filteredFilters);
                const allPageDurationSum = this.uxaBaseService.getData(uxaDTO);
                const actualAllPageDurationSum = allPageDurationSum.rows?.[0]?.[0] || 0;
                const timeOnSite = actualAllPageDurationSum ? (actualPageSum * 100 / actualAllPageDurationSum).toFixed(2) : 0;

                pageDurationSum.rows[0][0] = timeOnSite;
            }

            scoreData = pageDurationSum;
            //Set back the original attributes in the DTO
            uxaDTO.setMetricField(originalMetricField);
            uxaDTO.setMetric(originalMetric);
        } else {
            scoreData = this.uxaBaseService.getData(uxaDTO);
            let {
                changeData,
                dateData
            } = this.getChangeData(uxaDTO, scoreData);
            dateData = dateData ? dateData : this.getScoreDates(uxaDTO);

            externalResponse = {
                changeData,
                dateData
            };
        }
        externalResponse['scoreData'] = scoreData;

        return this.uxaBaseService.getTransformedData(uxaDTO, externalResponse);
    },

    getChangeData: function(uxaDTO, scoreData) {
        let changeData = null;
        let dateData = null;
        if (uxaDTO.isIncludeChange() || uxaDTO.isIncludeChangePercentage()) {

            dateData = this.getScoreDates(uxaDTO);
            //Apply prev dates.
            uxaDTO.setStartTime(dateData.previousStartTime);
            uxaDTO.setEndTime(dateData.previousEndTime);

            const updateFilterConfigs = uxaDTO.getFilterConfigurations().filter(filter =>
                ((filter.sysId && filter.sysId != 'appsee.date_range') || (filter.filterId && filter.filterId != "date_range")));

            new UXAUIAdaptor().setFilterAttributes(updateFilterConfigs, uxaDTO);

            const prevResponse = this.uxaBaseService.getData(uxaDTO);

            //Revert prev dates.
            uxaDTO.setStartTime(dateData.startTime);
            uxaDTO.setEndTime(dateData.endTime);

            const score = scoreData.rows?.[0]?.[0] || 0;
            const prevScore = prevResponse.rows?.[0]?.[0] || 0;
            changeData = this.utils.getPercentChange(score, prevScore, 0);
        }
        return {
            changeData,
            dateData
        };
    },

    getScoreDates: function(uxaDTO) {
        //DTO Start and EndTime is an object of GlideDateTime();
        const startTime = uxaDTO.getStartTime();
        const endTime = uxaDTO.getEndTime();

        const daysDifference = this.utils.calculateDayDifference(startTime, endTime);

        const previousEndTime = new GlideDateTime(startTime);
        previousEndTime.addSeconds(-1);

        let previousStartTime = new GlideDateTime(startTime);
        previousStartTime.addDaysLocalTime(-1 * daysDifference);

        //Updating prev range to last month, if date filter is this month
        uxaDTO.getFilterConfigurations()?.forEach((filter, index) => {
            if (UXAConstants.UXA_FILTER_TYPE.DATE == filter.type?.toLowerCase() &&
                filter?.dynamicTimeRange == 'SN_DYNAMIC_DATERANGE__THIS_MONTH') {
                previousStartTime = new GlideDateTime(startTime);
                previousStartTime.setDayOfMonthLocalTime(1);
                previousStartTime.addMonthsLocalTime(-1);
            }
        });

        return {
            startTime,
            endTime,
            previousStartTime,
            previousEndTime
        };
    },

    _processSessionsList: function(data, uxaDTO) {
        const selectedColumns = uxaDTO.getSelectedColumns();
        if (!selectedColumns?.length || (selectedColumns.includes('LAST_LOCATION') || selectedColumns.includes('BROWSER'))) {
            //Calculate Percentage and Add to Result
            let resColumns = data.columns;
            let index;
            let cityIndex;
            let browserTypeIndex;
            resColumns.forEach((element, idx) => {
                if (element[0] == UXAConstants.DATATABLE_COLUMNS.SESSIONS.LAST_LOCATION.COLUMNS[0])
                    cityIndex = idx;
                else if (element[0] == UXAConstants.DATATABLE_COLUMNS.SESSIONS.BROWSER.COLUMN)
                    browserTypeIndex = idx;
            });

            //Get CountryCodes from results.
            const countryCodes = [];
            if (cityIndex + 2 < resColumns.length) {
                data.rows.forEach(row => {
                    countryCodes.push(row[cityIndex + 2]);
                });
            }
            const countryWithCode = new QueryServiceAPI().getCountryNames(countryCodes);

            /**
             * cityIndex is index of City in result.
             * Using['City', 'Region', 'CountryCode'], it is going to populate Last Location.
             * 
             * Input: SESSION_DATE,SESSION_DURATION,HASHED_USER_ID,BROWSER,City,Region,CountryCode,NUMBER_OF_PAGES,NUMBER_OF_EVENTS
             * Output: SESSION_DATE,SESSION_DURATION,HASHED_USER_ID,BROWSER,LAST_LOCATION,NUMBER_OF_PAGES,NUMBER_OF_EVENTS
             */

            if (cityIndex) {
                data.columns = [...resColumns.slice(0, cityIndex), ["LAST_LOCATION", "LowCardinality(String)"], ...resColumns.slice(cityIndex + 3)];

                data.rows = data.rows.map(row => {
                    const lastLocation = (`${row[cityIndex]}, ${row[cityIndex+1]}, ${countryWithCode[row[cityIndex+2]]}`);
                    row = [...row.slice(0, cityIndex), `${lastLocation}`, ...row.slice(cityIndex + 3)];
                    return row;
                });
            }
        }
    },

    _addSessionPercent: function(data, uxaDTO) {
        if (data && data?.columns?.length === 0)
            return;
        const selectedColumns = uxaDTO.getSelectedColumns();

        const fieldsWithSameColumn = {
            'SESSIONS': 'PERCENT_OF_SESSIONS',
            'PERCENT_OF_SESSIONS': 'SESSIONS'
        };

        //Find missing column: 
        let missingColumn = '';
        data.columns.forEach((element, idx) => {
            if (fieldsWithSameColumn[element[0]])
                missingColumn = fieldsWithSameColumn[element[0]];

        });

        //If missingColumn found, check if its part of the selected columns
        if (missingColumn && selectedColumns.includes(missingColumn)) {
            //Get the index of missing column and update the response
            let missingColumnIndex = -1;
            let presentColumnIndex = -1;
            selectedColumns.forEach((element, idx) => {
                if (element === missingColumn)
                    missingColumnIndex = idx;
                else if (element === fieldsWithSameColumn[missingColumn])
                    presentColumnIndex = idx;
            });


            //Update the columns to include missing column
            //Insert the missing column in data.columns at missingColumnIndex along with its type
            data.columns.splice(missingColumnIndex, 0, [missingColumn, 'UInt64']); //

            //Update the row to replicate/copy the value at missingColumnIndex from presentColumnIndex
            data.rows = data.rows.map(row => {
                row.splice(missingColumnIndex, 0, row[presentColumnIndex]);
                return row;
            });
        }


        if (!selectedColumns?.length || selectedColumns.includes('PERCENT_OF_SESSIONS')) {

            //Get Unique Sessions
            const originalType = uxaDTO.getType();
            const originalMetric = uxaDTO.getMetric();
            const originalDataCategory = uxaDTO.getDataCategory();
            const originalPageSize = uxaDTO.getPageSize();

            uxaDTO.setType(UXAConstants.TYPE.SESSIONS);
            uxaDTO.setMetric(UXAConstants.METRIC.COUNT);
            uxaDTO.setDataCategory(UXAConstants.DATA_CATEGORY.SIMPLE);
            uxaDTO.setPageSize();
            new UXAUIAdaptor().setFilterAttributes(uxaDTO.getFilterConfigurations(), uxaDTO);

            const scoreData = this.uxaBaseService.getData(uxaDTO);
            const uniqueSessionCount = scoreData.rows?.[0]?.[0] || 0;

            uxaDTO.setType(originalType);
            uxaDTO.setMetric(originalMetric);
            uxaDTO.setDataCategory(originalDataCategory);
            uxaDTO.setPageSize(originalPageSize);

            let percentSessionIndex = -1;

            selectedColumns.forEach((element, idx) => {
                if (element == 'PERCENT_OF_SESSIONS')
                    percentSessionIndex = idx;
            });
            if (percentSessionIndex < 0)
                return;

            //Updating the session percent column type to String.
            data.columns[percentSessionIndex][1] = 'LowCardinality(String)';

            //Calculate Percentage and update percent of Session to Result
            const percentMultiplier = uniqueSessionCount ? 100 / uniqueSessionCount : 0;
            data.rows = data.rows.map(row => {
                if (row[percentSessionIndex]) {
                    const number = (row[percentSessionIndex] * percentMultiplier).toFixed(2);
                    row[percentSessionIndex] = `${number}%`;
                } else {
                    row[percentSessionIndex] = '';
                }
                return row;
            });
        }
    },

    _isExcludeOther: function(uxaDTO) {
        const groupBys = uxaDTO.getGroupBys();
        if (groupBys?.length)
            return [UXAConstants.DATA_POINTS_COLUMNS.HOURLY_USAGE].some(group => groupBys.includes(group));

        return false;
    },

    type: 'UXAVizService'
};
