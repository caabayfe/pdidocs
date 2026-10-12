var UXAGroupTransformer = Class.create();
UXAGroupTransformer.prototype = {
    initialize: function() {
        this.uxaUtils = new UXAUtils();
    },

    transform: function(res, uxaDTO) {
        let result = this._getResultObject();
        //res = JSON.parse('{"columns": [["Name", "LowCardinality(String)"], ["Occurrences", "UInt64"]], "rows": [["index", 4], ["PortalPageLoad", 3], ["sc_category", 3], ["Successful Login", 2], ["Search Result Selected", 1], ["sc_cat_item", 1], ["sp_search", 1], ["Initiate Search", 1]]}');
        result.response = {
            ...result.response,
            data: this._getData(res, uxaDTO),
            metadata: this._getMetaData(uxaDTO, res, result.response),
            filters: this.uxaUtils.getFilterObject(uxaDTO)
        };

        return result;
    },

    _getData: function(res, uxaDTO) {
        const resColumns = res?.columns;
        //Check if resColumns contains the group with UserProperties:
        const userPropertiesColumns = this.uxaUtils.getUserPropertyColumns(resColumns);

        const resRows = res?.rows;
        let referenceFieldsData;
        if (userPropertiesColumns?.length) {
            referenceFieldsData = this.uxaUtils.getUserPropsReferenceFieldsData(userPropertiesColumns, resRows);
        }

        let data = [];
        if (resColumns.length) {
            const groupsBys = uxaDTO.getGroupBys();
            const headers = [];
            for (let index = 0; index < groupsBys.length; index++) {
                const group = resColumns[index][0];
                headers.push(group);
                this.__updateGroupBys(res, uxaDTO, group, index);
            }

            headers.push(UXAConstants.VALUE);
            data.push(headers);

            if (userPropertiesColumns?.length) {
                res.rows = this._mapSysIdToDisplayValue(resRows, userPropertiesColumns, referenceFieldsData);
            }

            data = [...data, ...res.rows];
        }
        return data;
    },

    __updateGroupBys: function(res, uxaDTO, groupBy, index) {
        const groupsBys = uxaDTO.getGroupBys();
        switch (groupBy) {
            case UXAConstants.DATA_POINTS_COLUMNS.COUNTRY:
                var countryCodes = [];
                res?.rows?.forEach(row => countryCodes.push(row[index]));
                var countryWithCode = new QueryServiceAPI().getCountryNames(countryCodes);
                res.rows.map(row => {
                    row[index] = countryWithCode[row[index]];
                    return row;
                });
                break;
            case UXAConstants.DATA_POINTS_COLUMNS.BROWSER:
                var browserWithCode = new QueryServiceAPI().getBrowserTypes();
                var browsers = {};
                browserWithCode.forEach(element => {
                    browsers[element.k] = element.v;
                });
                res.rows.map(row => {
                    row[index] = browsers[row[index]] || row[index];
                    return row;
                });
                break;
            case UXAConstants.UXA_HOURLY_USAGE_ALIAS:
                if (index == 0)
                    res.rows = this._updateMissingData(res.rows, index, 24);
                res.rows.map(row => {
                    if (row.length) {
                        const hour = row[index];
                        const period = hour < 12 ? 'AM' : 'PM';
                        const updatedHour = hour % 12 === 0 ? 12 : hour % 12;
                        row[index] = `${updatedHour} ${period}`;
                    }
                    return row;
                });
                break;
            case UXAConstants.UXA_SESSION_DURATION_ALIAS:
                var durationBuckets = UXAConstants.DURATION_GROUPBY_BUCKETS;
                if (index == 0)
                    res.rows = this._updateMissingData(res.rows, index, 8);

                res.rows.map(row => {
                    if (row.length) {
                        const duration = row[index];
                        row[index] = durationBuckets[duration];
                    }
                    return row;
                });
                break;
            case UXAConstants.RETENTION_AVG_TIME_GROUPBY_ALIAS:
                var sessionBuckets = UXAConstants.RETENTION_AVG_TIME_SESSIONS_BUCKETS;
                var sessionsBucketMap = {};
                res.rows.forEach(row => sessionsBucketMap[row[0]] = row[1]);

                var updatedSessionBucketRows = [];
                for (let key in sessionBuckets) {
                    if (sessionsBucketMap[key])
                        updatedSessionBucketRows.push([sessionBuckets[key], sessionsBucketMap[key]]);
                    else
                        updatedSessionBucketRows.push([sessionBuckets[key], 0]);
                }
                res.rows = updatedSessionBucketRows;
                break;
            case UXAConstants.DATA_POINTS_COLUMNS.APPLICATION:
                var applications = (new UXAApplicationUtils()).getAllAppsForUser();
                var applicationSet = {};
                applications.forEach(app => {
                    applicationSet[app.AppSysId] = app.AppName;
                });
                res.rows.forEach(row => {
                    row[index] = applicationSet[row[index]] || row[index];
                });
                break;
            case UXAConstants.DATA_POINTS_COLUMNS.CHANNEL:
                var channels = (new UXAApplicationUtils()).getChannels();
                res.rows.forEach(row => {
                    if (row[index] == UXAConstants.CHANNEL_ENUM.NOWEXPERIENCE.NAME)
                        row[index] = UXAConstants.CHANNEL_ENUM.NEXTEXPERIENCE.NAME;
                    row[index] = channels[row[index]] ? channels[row[index]].value : row[index];
                });
                break;
        }
    },

    //Returns an Object
    _getMetaData: function(uxaDTO, res, {
        metadata
    }) {
        const metadataObj = {
            ...metadata,
            groupBy: this._getGroupBy(uxaDTO, res),
            series: this._getSeries(uxaDTO),
            format: this._getFormat(uxaDTO)
        };

        return metadataObj;
    },

    _getGroupBy: function(uxaDTO, res) {
        const resColumns = res.columns;
        const groupByMetadata = [];
        const groupBys = uxaDTO.getGroupBys();
        let index = 0;
        const groupValuesMap = this._getGroupByValues(uxaDTO, res);
        if (resColumns?.length) {
            for (let groupBy of groupBys) {
                const id = resColumns[index][0];
                const type = resColumns[index][1];
                groupByMetadata.push({
                    fieldType: type ? UXAConstants.COLUMN_TYPE_MAPPING[type] : UXAConstants.DEFAULT_FIELD_TYPE,
                    id,
                    label: groupBy || id,
                    series: this._getGroupBySeries(groupBy),
                    elements: this._getGroupByElements(uxaDTO, groupValuesMap, groupBy)
                });
                index++;
            }
        }
        return groupByMetadata;
    },

    _getGroupByElements: function(uxaDTO, groupValuesMap, groupBy) {
        const elements = [];
        const uniqueKeys = new Set();
        if (!groupValuesMap[groupBy]) {
            const element = {
                id: '',
                label: '',
                eventData: {}
            };
            elements.push(element);
        } else {
            for (let value of groupValuesMap[groupBy]) {
                if (groupBy.includes('Boolean')) {
                    value = (value === undefined || value === null) ? '(empty)' : String(value);
                }

                value = value ? value : '(empty)';
                if (!uniqueKeys.has(value)) {
                    uniqueKeys.add(value);
                    const element = {
                        id: value,
                        label: value,
                        eventData: {}
                    };
                    elements.push(element);
                }
            }
        }

        return elements;
    },

    _getGroupBySeries: function(groupBy) {
        const series = [];
        const seriesObject = {
            id: UXAConstants.VALUE,
            label: groupBy || UXAConstants.DEFAULT_GROUP_BY_LABEL,
            type: UXAConstants.VALUE
        };
        series.push(seriesObject);
        return series;
    },

    _getSeries: function(uxaDTO) {
        const series = [];
        const groupBys = uxaDTO.getGroupBys();
        for (let groupBy of groupBys) {
            const seriesObject = {
                id: UXAConstants.VALUE,
                label: groupBy || UXAConstants.DEFAULT_GROUP_BY_LABEL,
                type: UXAConstants.VALUE
            };
            series.push(seriesObject);
        }
        return series;
    },

    _getFormat: function(uxaDTO) {
        return {
            frequency: UXAConstants.TREND_MAPPING[uxaDTO.getTrendInterval()] || UXAConstants.TREND_INTERVAL.DAILY,
            unitFormat: this.__isPercentage(uxaDTO) ? '{0}%' : '{0}',
            precision: 0
        };
    },

    __isPercentage: function(uxaDTO) {
        if ((UXAConstants.TYPE.PAGES === uxaDTO.getType() && [UXAConstants.METRIC.PAGE_NAV.BAR_METRIC_NEXT_PAGE, UXAConstants.METRIC.PAGE_NAV.BAR_METRIC_PREVIOUS_PAGE].includes(uxaDTO.getMetric())) ||
            UXAConstants.METRIC_FIELD.RETENTION.SESSION_FREQUENCY === uxaDTO.getMetricField())
            return true;
        return false;
    },

    _getResultObject: function() {
        return {
            order: 0,
            response: {
                data: [],
                filters: {
                    "appliedFilters": [],
                    "notAppliedFilters": []
                },
                metadata: {
                    aggregateBy: 0,
                    //dataSourceLabel: "TODO: custom later",
                    format: {
                        unitFormat: '{0}',
                    },
                    groupBy: [],
                    timeZone: "SESSION"
                }
            }
        };
    },

    _updateMissingData: function(data, index, dataLength) {
        if (data?.length) {
            const dataSet = new Set(data.map(item => item[index]));

            // Define the range
            const dataRanges = Array.from({
                length: dataLength
            }, (_, i) => i);

            // Loop through ranges and add missing range data
            const columnCount = data[0].length;
            dataRanges.forEach(range => {
                if (!dataSet.has(range)) {
                    data.push([range, ...Array(columnCount - 1).fill('')]);
                }
            });

            data.sort((a, b) => a[index] - b[index]);
        }
        return data;
    },

    _getGroupByValues: function(uxaDTO, res) {
        const groupValuesMap = {};
        const groupBys = uxaDTO.getGroupBys();
        for (let groupBy of groupBys) {
            if (!groupValuesMap[groupBy]) {
                groupValuesMap[groupBy] = new Set();
            }
        }

        for (let index = 0; index < groupBys.length; index++) {
            const group = groupBys[index];
            res.rows.forEach(row => {
                groupValuesMap[group].add(row[index]);
            });
        }

        return groupValuesMap;
    },


    _mapSysIdToDisplayValue: function(resRows, userPropertiesColumns, referenceFieldsData) {
        return resRows.map(row => {
            //Replace sysId for the user properties with display value. 
            //Row can contain the max 2 user properties in the group + stack case
            userPropertiesColumns.forEach(userProperty => {
                const {
                    idx,
                    property
                } = userProperty;

                const [type, table, referenceField] = property.split("__");
                const value = row[idx];

                //Check if value is not undefined
                if (!value)
                    return;

                //For valid value of sysId, get its display value and update in the response row
                row[idx] = referenceFieldsData?.[referenceField]?.[value] || value;
            });

            return row;
        });
    },

    type: 'UXAGroupTransformer'
};
