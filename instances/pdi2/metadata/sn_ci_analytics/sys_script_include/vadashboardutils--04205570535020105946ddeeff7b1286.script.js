var VADashboardUtils = Class.create();
/*
Transform Data broker utils to reuse common functionality for widgets.
*/
VADashboardUtils.prototype = {
    initialize: function() {
        this.V_TABLE_START_PAGE = 1;
        this.V_TABLE_MAX_ROWS = parseInt(gs.getProperty("glide.script.vtable.max_rows", 1000));
        this.V_TABLE_MAX_PAGE_CHUNK_SIZE = 1000;
        this.DASHBOARD_EXPORT_LIMIT = parseInt(gs.getProperty("sn_ci_analytics.dashboard.export_limit", 1000));
    },

    getDiffInPercentage: function(curVal, prevVal) {
        if (prevVal === 0) {
            return '';
        }
        return (((curVal - prevVal) / prevVal) * 100).toFixed(0) + '%';
    },

    // input val in date string format "yyyy-mm-dd"
    // returns elapsed time in milliseconds since January 1, 1970, 00:00:00 GMT.
    getTimeinMillis: function(date) {
        return new GlideDateTime(date).getNumericValue();
    },

    // input num in number format
    // output string in Thousands as 'K' format like [1.20K], millions as 'M' format like [1.20M]
    numFormatter: function(num) {
        var million = Math.pow(10, 6);
        var billion = Math.pow(10, 9);
        var convertedNum = 0;
        var suffix = '';
        if (num > 999 && num < million) {
            suffix = 'K';
            convertedNum = (num / 1000).toFixed(2);
        } else if (num >= million && num < billion) {
            suffix = 'M';
            convertedNum = (num / million).toFixed(2);
        } else if (num >= billion) {
            suffix = 'B';
            convertedNum = (num / billion).toFixed(2);
        } else {
            convertedNum = num;
        }
        var intNum = parseInt(convertedNum);
        // Remove ".0" and display it as full integer like 1.0K to 1K
        if (convertedNum === intNum) {
            convertedNum = intNum;
        }
        return convertedNum + suffix;
    },

    // input days in  number
    // output bucketType in string
    getBucketType: function(daysDiff) {
        if (daysDiff < 35) return 'day';
        if (daysDiff >= 35 && daysDiff < 150) return 'week';
        return 'month';
    },

    // input fromdate: string & toDate : string in yyyy-mm-dd format
    // output difference in days : number
    getDays: function(fromDate, toDate) {
        var glideFromDate = new GlideDateTime(fromDate);
        var glideToDate = new GlideDateTime(toDate);
        var duration = GlideDate.subtract(glideFromDate, glideToDate); // The difference between fromDate and toDate
        var daysInclusiveToDate = duration.getDayPart() + 1;
        return daysInclusiveToDate;
    },

    // input timeSeries data in object format { "2020-09-21": 4, "2020-10-18": 1}
    // output timeStamp array [ {timestamp: 1501843274096, y0: 282.67}, {timestamp: 1511434701664, y0: 300.00}]ß
    transformTimeSeries: function(timeSeries) {
        var convertedTimeSeries = [],
            self = this;
        for (var date in timeSeries) {
            if (timeSeries.hasOwnProperty(date)) {
                convertedTimeSeries.push([date, timeSeries[date]]);
            }
        }
        convertedTimeSeries.forEach(function(data, index) {
            data[0] = self.getTimeinMillis(data[0]);
        });
        convertedTimeSeries.sort(function(a, b) {
            return a[0] - b[0];
        });
        var finalChartData = convertedTimeSeries.map(function(data) {
            return {
                "timestamp": data[0],
                y0: data[1]
            };
        });
        return finalChartData;
    },

    // Accepts currentFromDate, currentToDate as date string in yyyy-MM-dd format
    // returns previous period's start & end date in string type with format yyyy-MM-dd
    getPreviousPeriod: function(currentFromDate, currentToDate) {
        var glideFromDate = new GlideDateTime(currentFromDate);
        var glideToDate = new GlideDateTime(currentToDate);
        // getDays() is not reused here because of creating twice GlideDateTime object tradeoff vs readabilty
        var duration = GlideDate.subtract(glideFromDate, glideToDate); // The difference between From and To
        var daysInclusiveToDate = duration.getDayPart() + 1;
        var periodDurInMS = daysInclusiveToDate * 86400000; // Milliseconds in a day is 86400000

        glideFromDate.subtract(periodDurInMS);
        glideToDate.subtract(periodDurInMS);
        var previousPeriod = {
            fromDate: glideFromDate.getDate().toString(),
            toDate: glideToDate.getDate().toString()
        };
        return previousPeriod;
    },

    // obj = { parent: { child1: { child2:true } } }
    // dotPath = array format like ['child1','child2']
    // defaultValue - user defined value as fallback value
    // example: safelyGet(obj, ['child1','child2'], false) would returns true
    safelyGet: function(obj, dotPath, defaultValue) {
        if (typeof(obj) !== "object" || !Array.isArray(dotPath)) {
            var transformErrorMessage = gs.getMessage('User transform error: invalid input {0} {1}', obj, dotPath);
            gs.addInfoMessage(transformErrorMessage);
            return defaultValue;
        }
        var foundProp = obj;
        var path = dotPath;
        for (var i = 0; i < path.length; i++) {
            if (!foundProp.hasOwnProperty(path[i]))
                return defaultValue;

            foundProp = foundProp[path[i]];
        }
        return foundProp || defaultValue;
    },

    // input date in string yyyy-mm-dd format
    // returns boolean
    isValidDate: function(date) {
        if (!date)
            return false;
        var gdt = new GlideDateTime();
        gdt.setDisplayValue(date);
        return gdt.isValid() && gdt.hasDate();
    },

    decodeFilter: function(encodedFilter) {
        var filters = encodedFilter.match(/(?:.*)sys_idISNOTEMPTY\^ORsys_id=("?{.*}"?)(.*)/);
        var orderByValue = filters && filters[2] && filters[2].match(/(?:.*)\^(ORDERBYDESC|ORDERBY)(.*?)(?:\^.*|$)/) || [];
        var filter = filters && filters[1] ? JSON.parse(filters[1]) : {};
        var sortDirection = orderByValue && orderByValue[1] === 'ORDERBYDESC' ? 2 : 1;
        var sortField = orderByValue && orderByValue[2] || '';
        var pageSize = Number(gs.getProperty('glide.script.vtable.max_rows', 1000));
        var result = {
            filter: filter,
            sort_direction: sortDirection,
            sort_field: sortField,
            page_size: pageSize,
            page_num: 1
        };
        CIAnalyticsLogger.getLogger().debugJson('Decoded filter result - {}', result);
        return result;
    },

    // in place alphabetical sort util
    sortNames: function(names, key) {
        if (!key) {
            names.sort(function(a, b) {
                return a.toLowerCase().localeCompare(b.toLowerCase());
            });
        } else {
            names.sort(function(a, b) {
                return a[key].toLowerCase().localeCompare(b[key].toLowerCase());
            });
        }
    },

    // input date in yyyy-mm-dd format
    // returns monday of the week with the given date in yyyy-mm-dd format
    getEarliestDayOfTheWeek: function(date) {
        var gd = new GlideDateTime(date);
        var days = gd.getDayOfWeekUTC();
        gd.addDaysUTC(-1 * (days - 1));
        return gd;
    },

    // input date in yyyy-mm-dd format
    // returns first date of the month with the given date in yyyy-mm-dd format
    getEarliestDayOfTheMonth: function(date) {
        var gd = new GlideDateTime(date);
        var days = gd.getDayOfMonthUTC();
        gd.addDaysUTC(-1 * (days - 1));
        return gd;
    },

    // input dateList as Object like {"2020-12-09":2,"2020-12-08":9,"2020-12-03":3,"2020-12-04":1,"2020-12-06":3,"2020-12-07":2}
    // input dateList as nested Object like {"2020-12-07":{"Occurrences":1,"Sessions":1}}
    // input date as string in yyyy-mm-dd format
    // input resetProps as array format like ['Occurrences', 'Sessions'] to inject zero with the specified keys for empty dates
    fillEmptyDataInProps: function(dateList, date, resetProps) {
        resetProps = resetProps || [];
        if (resetProps.length) {
            var props = {};
            resetProps.forEach(function(prop) {
                props[prop] = 0;
            });
            dateList[date] = props;
        } else {
            dateList[date] = 0;
        }
    },

    // input date as string in yyyy-mm-dd format
    // buckettype as string, possible types - 'day', 'month', 'week'
    getDateByBucketType: function(date, bucketType) {
        switch (bucketType) {
            case 'week':
                return this.getEarliestDayOfTheWeek(date);
            case 'month':
                return this.getEarliestDayOfTheMonth(date);
            default:
                return new GlideDateTime(date);
        }
    },

    // input date as yyyy-mm-dd format
    // bucketType as string possible types - 'day', 'month', 'week'
    // add days or weeks or months to the given date based on the bucket type
    addDaysByBucketType: function(date, bucketType) {
        switch (bucketType) {
            case 'week':
                date.addWeeksUTC(1);
                break;
            case 'month':
                date.addMonthsUTC(1);
                break;
            default:
                date.addDaysUTC(1);
        }
    },

    // input startDate as string in yyyy-mm-dd format
    // input endDate as string in yyyy-mm-dd format
    // input dateList as Object like {"2020-12-09":2,"2020-12-08":9,"2020-12-03":3,"2020-12-04":1,"2020-12-06":3,"2020-12-07":2}
    // input dateList as nested Object like {"2020-12-07":{"Occurrences":1,"Sessions":1}}
    // input resetProps as array format like ['Occurrences', 'Sessions'] to inject zero with the specified keys of dataList for empty dates
    addMissingDates: function(startDate, endDate, dateList, bucketType, resetProps) {
        datelist = JSON.parse(JSON.stringify(dateList));
        startDate = this.getDateByBucketType(startDate, bucketType);
        endDate = this.getDateByBucketType(endDate, bucketType);
        var currentDate;
        var props;
        while (startDate.onOrBefore(endDate)) {
            currentDate = startDate.getDate();
            if (!datelist.hasOwnProperty(currentDate)) {
                this.fillEmptyDataInProps(datelist, currentDate, resetProps);
            }
            this.addDaysByBucketType(startDate, bucketType);
        }
        return datelist;
    },
    encodeFilter: function(filter) {
        var encodedFilter = 'sys_idISNOTEMPTY^ORsys_id=' + JSON.stringify(filter);
        CIAnalyticsLogger.getLogger().debug('Encoded filter - ' + encodedFilter);
        return encodedFilter;
    },

    getConversationFilterQuery: function(query, pageSize, pageNum) {
        var sortFieldMapper = {
            "date": "SessionStartTime",
            "user_index": "UserAppIndex",
            "duration": "SessionDuration",
            "user_id": "", //"AppUserId",
            "channel": "", //"ChannelName",
            "language": "", //"Locale",
            "topics": "", //"ScreenCount",
            "favorite": "", //"IsFavorite",
            "end_state": "" //"EndState",
        };
        var requestFields = null;
        var decodedQuery = this.decodeFilter(query);
        var filter = decodedQuery.filter;
        if (filter.query) {
            var totalFilter = {};
            var parsedQuery = JSON.parse(filter.query);
            var fromDate = filter.from_date;
            var toDate = filter.to_date;

            //if pageSize and pageNum exists (for pagination to Export records), make it higher priority
            if (pageSize && pageNum) {
                if (filter.page_size) filter.page_size = pageSize;
                if (filter.page_num) filter.page_num = pageNum;

                if (decodedQuery.page_size) decodedQuery.page_size = pageSize;
                if (decodedQuery.page_num) decodedQuery.page_num = pageNum;
            }

            // Temorary check for comparisonModel array because we are keeping appsee
            // query builder active too for QE.
            if (Array.isArray(parsedQuery)) {
                var vaConditionBuilderUtil = new sn_ci_analytics.VAConditionBuilderUtil();
                parsedQuery = vaConditionBuilderUtil.convertToAppsee(parsedQuery);
                parsedQuery = parsedQuery.query;
            }

            var queryKey = Object.keys(parsedQuery)[0] || "and";
            parsedQuery[queryKey] = parsedQuery[queryKey] || [];

            if (fromDate && toDate) {
                var timeQuery = {
                    "SessionStartTime": {
                        "gte": fromDate + "T00:00:00",
                        "lte": toDate + "T23:59:59"
                    }
                };
                if (queryKey == "and")
                    parsedQuery[queryKey].push(timeQuery);
                else {
                    timeQuery[queryKey] = parsedQuery[queryKey];
                    parsedQuery = {
                        "and": [
                            timeQuery
                        ]
                    };
                }
                totalFilter = {
                    "and": [
                        timeQuery
                    ]
                };
            }

            //Default sort for conversations is by latest date
            var sortField = sortFieldMapper[decodedQuery.sort_field] || 'SessionStartTime';
            var sortDirection = sortFieldMapper[decodedQuery.sort_field] ? decodedQuery.sort_direction : 2;

            requestFields = {
                filterQuery: {
                    "page_size": filter.page_size || decodedQuery.page_size,
                    "page_num": filter.page_num || decodedQuery.page_num,
                    "sort_direction": sortDirection,
                    "sort_field": sortField,
                    "query": JSON.stringify(parsedQuery)
                },
                totalQuery: {
                    "page_size": filter.page_size || decodedQuery.page_size,
                    "page_num": filter.page_num || decodedQuery.page_num,
                    "sort_direction": sortDirection,
                    "sort_field": sortField,
                    "query": JSON.stringify(totalFilter)
                }
            };
        }
        return requestFields;
    },

    // computes absolute percentage if absolute is true (numerator/denominator)*1, otherwise convert to 100 scale percentage
    // returns percentage with precision 1
    getPercentage: function(numerator, denominator, absolute) {
        var mutiply = absolute ? 1 : 100;
        var percentage = (denominator !== 0) ? ((numerator / denominator) * mutiply) : 0;
        return absolute ? percentage : percentage.toFixed(1);
    },
    // converts value to 100 scale/ percentage
    // return val to string appended with '%' symbol

    toPercentageDisplayValue: function(val, fixed) {
        return val ? ((val * 100).toFixed(fixed || 1).toString()) + '%' : '0%';
    },

    // checks if object is empty or not
    // returns true if object is empty or false if not empty
    isEmpty: function(obj) {
        for (var key in obj) {
            return false;
        }
        return true;
    },

    // Returns the glideDateTime Object with display value set to an UTC Timezone.
    // Using these method to display the date in the UTC format instead of showing in user time zone.
    getUtcDateTime: function(date) {
        var utcDateTime = null;
        if (date) {
            var dateTime = new GlideDateTime('1970-01-01');
            dateTime.add(date);
            dateTime = dateTime.getValue().toString();
            utcDateTime = new GlideDateTime();
            utcDateTime.setValue(dateTime);
        }
        return utcDateTime;
    },

    // Turns object's keys into camel case keys
    // For example: { ManAge: 14, Name: 'Pablo', FavoriteActivity: 'guitar' } will turn into: { age: 14, name: 'Pablo', favoriteActivity: 'guitar' }
    // Also supports Arary of objects
    toCamel: function(o) {
        var self = this;

        var newO, origKey, newKey, value;

        if (o instanceof Array) {
            return o.map(function(value) {
                if (typeof value === "object") {
                    value = self.toCamel(value);
                }
                return value;
            });
        } else {
            newO = {};

            for (origKey in o) {
                if (o.hasOwnProperty(origKey)) {
                    newKey = (origKey.charAt(0).toLowerCase() + origKey.slice(1) || origKey).toString();
                    value = o[origKey];

                    if (value instanceof Array || (value !== null && value.constructor === Object)) {
                        value = self.toCamel(value);
                    }
                    newO[newKey] = value;
                }
            }
        }

        return newO;
    },

    getDaysFromMilliseconds: function(milliseconds) {
        var dur = new GlideDuration(milliseconds);
        return dur.getDayPart();
    },

    getFormattedTime: function(milliseconds) {
        var glideTime = new GlideTime(milliseconds);
        var timeParts = {
            DAY: {
                value: this.getDaysFromMilliseconds(milliseconds),
                singularPrefix: gs.getMessage('Day'),
                pluralPrefix: gs.getMessage('Days'),
            },
            HOUR: {
                value: glideTime.getHourUTC(),
                singularPrefix: gs.getMessage('Hour'),
                pluralPrefix: gs.getMessage('Hours'),
            },
            MINUTE: {
                value: glideTime.getMinutesUTC(),
                singularPrefix: gs.getMessage('Minute'),
                pluralPrefix: gs.getMessage('Minutes'),
            },
            SECOND: {
                value: glideTime.getSeconds(),
                singularPrefix: gs.getMessage('Second'),
                pluralPrefix: gs.getMessage('Seconds'),
            }
        };

        var formattedTime = Object.keys(timeParts).reduce(function(timeStr, key) {
            var timePart = timeParts[key];
            return (timePart.value) ? timeStr + timePart.value + ' ' + (timePart.value > 1 ? timePart.pluralPrefix : timePart.singularPrefix) + ' ' : timeStr;
        }, '');

        return formattedTime;
    },

    getChangeInfoTextForScoreCard: function(curentCount, previousCount) {
        var changeText = '';
        var difference = Math.abs(curentCount - previousCount);
        if (difference > 0) {
            changeText = this.numFormatter(difference) + '';
            if (previousCount > 0) {
                var percentageChange = this.getDiffInPercentage(curentCount, previousCount);
                if (!percentageChange.includes('-'))
                    percentageChange = '+' + percentageChange;

                changeText += ' (' + percentageChange + ')';
            }
        }
        return changeText;
    },

    getUserName: function(hasedUserId) {
        var userGr = new GlideRecord('sys_user');
        var userName = '';
        userGr.addQuery('hashed_user_id', hasedUserId);
        userGr.query();
        if (userGr.next()) {
            userName = userGr.getValue('user_name');
        }
        return userName;
    },

    // Returns the sys_id of the topic name
    getSysIdForTopic: function(name) {
        var sysId = '';
        if (!name)
            return sysId;

        var topicGr = new GlideRecord('sys_cs_topic');
        topicGr.addQuery('name', name);
        topicGr.query();
        if (topicGr.next())
            sysId = topicGr.getUniqueValue();

        return sysId;
    },

    getSysIdForTopicCategory: function(name) {
        var sysId = '';
        if (!name)
            return sysId;
        var topicCategoryGr = new GlideRecord('sys_cb_topic_category');
        topicCategoryGr.addQuery('sys_name', name);
        topicCategoryGr.query();
        if (topicCategoryGr.next())
            sysId = topicCategoryGr.getUniqueValue();
        return sysId;
    },

    getSysIdForSpoke: function(name) {
        var sysId = '';
        if (!name)
            return sysId;
        var customBreakdownGr = new GlideRecord('sn_ci_analytics_custom_breakdown');
        customBreakdownGr.addQuery('breakdown_name', 'spoke');
        customBreakdownGr.addQuery('breakdown_value', name);
        customBreakdownGr.query();
        if (customBreakdownGr.next())
            sysId = customBreakdownGr.getUniqueValue();
        return sysId;
    },

    getTopicByCategory: function(filter, categoryList) {
        var body = {
            from_date: filter.from_date,
            to_date: filter.to_date,
            event_type_filter: "Topic Category"
        };
        var response = AnalyticsServiceInvoker.invoke("Event", "getAnalyticsEventPropertyValues", body);
        var topicsArray = [];
        categoryList.forEach(function(category) {
            var topics = response && response[body.event_type_filter] && response[body.event_type_filter][category.id] ? response[body.event_type_filter][category.id]["Topic Name"] : {};
            topicsArray.push(Object.keys(topics));
        });
        return [].concat.apply([], topicsArray);
    },

    type: 'VADashboardUtils'
};
