var UXATrendTransformer = Class.create();
UXATrendTransformer.prototype = {
    initialize: function() {},

    transform: function(response, uxaDTO) {
        let result = this._getResultObject();
        //response = JSON.parse('{"columns": [["Day", "DateTime(\'UTC\')"], ["Occurrences", "UInt64"]], "rows": [["2023-01-14 00:00:00", 12], ["2023-02-25 00:00:00", 23], ["2023-03-15 00:00:00",12], ["2023-05-04 00:00:00", 41], ["2023-06-14 00:00:00", 112], ["2023-06-20 00:00:00", 43], ["2023-07-05 00:00:00", 11], ["2023-07-08 00:00:00", 61], ["2023-07-21 00:00:00", 13], ["2023-07-28 00:00:00", 21], ["2023-08-11 00:00:00", 61], ["2023-08-20 00:00:00", 11], ["2023-09-01 00:00:00", 14], ["2023-10-28 00:00:00", 54], ["2023-11-23 00:00:00", 21], ["2024-02-18 00:00:00", 13], ["2024-04-23 00:00:00", 1], ["2024-06-04 00:00:00", 23], ["2024-06-13 00:00:00", 14], ["2024-06-28 00:00:00", 11]]}');
        result.response = {
            ...result.response,
            data: this._getData(response, uxaDTO),
            metadata: this._getMetaData(uxaDTO, result.response, response),
            filters: new UXAUtils().getFilterObject(uxaDTO)
        };
        return result;
    },

    //Returns Array of Array
    _getData: function(response, uxaDTO) {
        if (uxaDTO.getGroupBys()?.length)
            return this._getGroupedData(response, uxaDTO);

        const headers = [UXAConstants.TIMESTAMP, UXAConstants.VALUE];
        let dataMap = {};
        let startDate;
        let endDate;

        //Get startDate and EndDate of Data.
        //Prepare DataMap for quick lookup, to update the data for full range of dates
        response.rows.forEach((row, index) => {
            endDate = row?.[0]?.substring(0, 10);
            if (index == 0)
                startDate = endDate;
            dataMap[endDate] = row?.[1];
        });

        let data = [];
        //Get dataRange values between startDate and endDate.
        if (startDate && endDate) {
            if ([UXAConstants.TREND_INTERVAL.DAILY, UXAConstants.TREND_INTERVAL.DAY].includes(uxaDTO.getTrendInterval())) {
                startDate = uxaDTO.getStartTime();
                endDate = uxaDTO.getEndTime();
            }
            const dateRange = this.generateDateRange(startDate, endDate, uxaDTO.getTrendInterval());
            data = this.updateMissingDateRange(dataMap, dateRange);
        }
        return [headers, ...data];
    },

    _getGroupedData: function(response, uxaDTO) {
        const data = [];
        let groupBys = [...new Set(response.rows.map((item, index) => {
            return item[1];
        }))];

        if (groupBys?.length === 0 && uxaDTO.getGroupBys().includes('NavigationType'))
            return data;

        response.groupBys = groupBys;
        //Create result header
        var values = ["timestamp"];
        groupBys.forEach(function(groupby, index) {
            values.push(UXAConstants.VALUE + index);
        });

        var timestamp = '';

        /**
			 * input=> 
			 "response.result.result[0]?.values": [
				[ "1708300800", "Utah", "24440.36"],
				[ "1708300800", "Vancouver", "15280.279999999999"],
				[ "1708300800", "Tokyo", "3174"],
				[ "1708905600", "Utah", "14927.720000000001"],
				[ "1708905600", "Vancouver", "10516.57"],
				[ "1708905600", "Tokyo", "1466"],
				[ "1709510400", "Utah", "12236.289999999999"],
				[ "1709510400", "Vancouver", "7668.28"],
				[ "1709510400", "Tokyo", "733"]
			]

			output=>
			resp.data = [
				["timestamp","value0","value1","value2" ],
				["1708300800000","24440.36", "15280.279999999999", "3174"],
				["1708905600000", "14927.720000000001", "10516.57", "1466"],
				["1709510400000", "12236.289999999999", "7668.28", "733"]
			];
			 */
        response.rows.forEach(function(dataArr) {
            let iTimestamp, iGroup, iValue;

            iTimestamp = dataArr[0]?.substring(0, 10);
            iGroup = dataArr[1];
            iValue = dataArr[2];


            const index = groupBys.findIndex(function(groupby) {
                return groupby.toLowerCase() === iGroup.toLowerCase();
            });
            let startDate;
            let endDate;
            if (timestamp != iTimestamp) {
                data.push(values);
                timestamp = iTimestamp;
                values = Array(groupBys.length + 1).fill('0');
                values[0] = (new Date(timestamp)).getTime().toString();
            }
            if (index !== -1) {
                values[index + 1] = iValue;
            }
        });

        data.push(values);

        return data;
    },

    updateMissingDateRange: function(dataMap, dateRange) {
        const data = dateRange.map(date => {
            const count = dataMap[date] || 0;
            const time = (new Date(date)).getTime().toString();
            return [time, count];
        });
        return data;
    },

    generateDateRange: function(startDate, endDate, interval) {
        const dateRange = [];
        let currentDate = new GlideDateTime(startDate);
        endDate = new GlideDateTime(endDate);

        while (currentDate <= endDate) {
            dateRange.push(currentDate.getDate().getValue());
            switch (interval) {
                case UXAConstants.TREND_INTERVAL.DAY:
                case UXAConstants.TREND_INTERVAL.DAILY:
                    currentDate.addDaysUTC(1); // Increment by one day
                    break;
                case UXAConstants.TREND_INTERVAL.WEEK:
                case UXAConstants.TREND_INTERVAL.WEEKLY:
                    currentDate.addWeeksUTC(1); // Increment by one week
                    break;
                case UXAConstants.TREND_INTERVAL.MONTH:
                case UXAConstants.TREND_INTERVAL.MONTHLY:
                    currentDate.addMonthsUTC(1); // Increment by one month
                    break;
                default:
                    throw new Error("Unsupported interval");
            }
        }
        return dateRange;
    },


    //Returns Array of Array
    _getData2: function(response) {
        const dataArray = [
            [UXAConstants.TIMESTAMP, UXAConstants.VALUE],
            ...response.map(point => [point[0], point[1]]),
        ];
        return dataArray;
    },

    //Returns an Object
    _getMetaData: function(uxaDTO, {
        metadata
    }, {
        groupBys
    }) {
        const metadataObj = {
            ...metadata,
            trendBy: this._getTrendBy(uxaDTO),
            series: this._getSeries(uxaDTO),
            format: this._getFormat(uxaDTO)
        };

        //TODO: When GroupBy trend is configured
        if (groupBys)
            metadataObj.groupBy = this._getGroupBy(uxaDTO, groupBys);

        return metadataObj;
    },

    //TODO: Modify this when groupBy trend is configured.
    _getGroupBy: function(uxaDTO, groups) {
        const groupBys = [];
        const elements = [];
        groups.forEach(function(groupby, index) {
            const seriesObj = {
                "id": UXAConstants.VALUE + index,
                "type": UXAConstants.VALUE,
                "label": uxaDTO.getType() === UXAConstants.TYPE.PERFORMANCE ? this._getNavigationType(groupby) : groupBy
            };

            const elementObj = {
                "series": [seriesObj],
                "id": groupby.toLowerCase(),
                "label": uxaDTO.getType() === UXAConstants.TYPE.PERFORMANCE ? this._getNavigationType(groupby) : groupBy
            };
            elements.push(elementObj);
        }, this);

        const requestedGroupBys = uxaDTO.getGroupBys();
        if (requestedGroupBys?.length) {
            for (let groupBy of requestedGroupBys) {
                groupBys.push({
                    "id": groupBy || UXAConstants.DEFAULT_GROUP_BY_ID,
                    "fieldType": UXAConstants.DEFAULT_FIELD_TYPE,
                    "label": groupBy || UXAConstants.DEFAULT_GROUP_BY_LABEL,
                    "elements": elements
                });
            }
        }

        return groupBys;
    },

    _getTrendBy: function(uxaDTO) {
        const trendBy = {
            fieldType: "glide_date_time",
            id: "start_time",
            label: "Start Time"
        };
        //return uxaDTO.getTrendBy();
        return trendBy;
    },

    _getSeries: function(uxaDTO) {
        const series = [];

        const seriesObject = {
            id: UXAConstants.VALUE,
            label: uxaDTO.getType() || "Label",
            type: UXAConstants.VALUE
        };

        series.push(seriesObject);
        return series;
    },

    _getFormat: function(uxaDTO) {
        return {
            frequency: UXAConstants.TREND_MAPPING[uxaDTO.getTrendInterval()] || UXAConstants.TREND_INTERVAL.DAILY,
            unitFormat: '{0}'
        };
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
                    dataSourceLabel: "TODO: custom later",
                    timeZone: "SESSION",
                    eventData: {},
                    format: {
                        frequency: UXAConstants.TREND_INTERVAL.DAILY,
                        unitFormat: '{0}',
                        precision: 0
                    },
                    trendBy: {
                        label: '',
                        id: '',
                        fieldType: ''
                    },
                    series: [{
                        label: '',
                        id: '',
                        type: ''
                    }, ],
                }
            }
        };
    },

    _getNavigationType: function(navigationType) {
        if (!navigationType)
            return navigationType;

        let navigationTypeLabel = '';
        if (navigationType === 'navigate' || navigationType === 'navigation') {
            navigationTypeLabel = 'Client Page Load';
        } else if (navigationType === 'direct load' || navigationType === 'page load') {
            navigationTypeLabel = 'Full Page Load';
        }
        return navigationTypeLabel;
    },

    type: 'UXATrendTransformer'
};
