var VADashboardMetrics = Class.create();
VADashboardMetrics.prototype = {
    initialize: function() {},



    getTotalUsers: function(fromDate, toDate) {
        var _totalUsers = 0;
        try {
            var response = AnalyticsServiceInvoker.invoke('User', 'getAnalyticsTotalUsers', {
                from_date: fromDate,
                to_date: toDate,
                platform: "chat"

            });
            if (response && response.TotalUsers)
                _totalUsers = response.TotalUsers;
        } catch (e) {
            var message = "VADashboardMetrics: Exception while fetching total active users : " + e.message;
            if (e.stack)
                message = message + "\n" + e.stack;
            CIAnalyticsLogger.getLogger('VADashboardMetrics').error(message);
        }
        return _totalUsers;
    },

    getActiveUsersTrend: function(from_date, to_date) {
        var _result = {
            totalUsers: 0,
            change: '',
            chartData: ''
        };

        // Validate input
        var vaUtils = new sn_ci_analytics.VADashboardUtils();
        if (!vaUtils.isValidDate(from_date) || !vaUtils.isValidDate(to_date))
            return _result;

        var previousPeriod = vaUtils.getPreviousPeriod(from_date, to_date);
        var currentDurationActiveUsers = this.getTotalUsers(from_date, to_date);
        var previousDurationActiveUsers = this.getTotalUsers(previousPeriod.fromDate, previousPeriod.toDate);

        _result.totalUsers = currentDurationActiveUsers;
        _result.change = vaUtils.getChangeInfoTextForScoreCard(currentDurationActiveUsers, previousDurationActiveUsers);

        var requestBody = {
            from_date: from_date,
            to_date: to_date,
            platform: 'chat'
        };

        requestBody.date_bucket = vaUtils.getBucketType(vaUtils.getDays(requestBody.from_date, requestBody.to_date));
        var currentDurationActiveUsersTimeSeries = AnalyticsServiceInvoker.invoke("User", "getAnalyticsTotalUsersByDate", requestBody);
        if (vaUtils.isEmpty(currentDurationActiveUsersTimeSeries)) {
            return _result;
        }
        currentDurationActiveUsersTimeSeries = vaUtils.addMissingDates(requestBody.from_date, requestBody.to_date, currentDurationActiveUsersTimeSeries, requestBody.date_bucket);
        _result.chartData = vaUtils.transformTimeSeries(currentDurationActiveUsersTimeSeries);

        return _result;

    },


    getSessionsCount: function(from_date, to_date) {
        var vaUtils = new sn_ci_analytics.VADashboardUtils();
        if (!vaUtils.isValidDate(from_date) || !vaUtils.isValidDate(to_date)) {
            var result = {
                totalSessions: '0'
            };
            CIAnalyticsLogger.getLogger('VADashboardMetrics').debugJson('getConversationsCount result - {}', result);
            return result;
        }
        var previousPeriod = vaUtils.getPreviousPeriod(from_date, to_date);
        var requestBody = {
            from_date: previousPeriod.fromDate,
            to_date: previousPeriod.toDate,
            platform: 'chat'
        };
        var results = AnalyticsServiceInvoker.invoke("Session", "getAnalyticsTotalSessions", requestBody);

        var result = {
            totalSessions: results.TotalSessions
        };
        CIAnalyticsLogger.getLogger('VADashboardMetrics').debugJson('getConversationsCount - {}', result);

        return result;
    },


    getConversationChartData: function(from_date, to_date) {

        var vaUtils = new sn_ci_analytics.VADashboardUtils();
        var requestBody = {
            from_date: from_date,
            to_date: to_date,
            platform: 'chat'
        };
        var result = {
            chartData: []
        };
        if (!vaUtils.isValidDate(from_date) || !vaUtils.isValidDate(to_date)) {
            CIAnalyticsLogger.getLogger('VADashboardMetrics').debugJson('getConversationChartData result - {}', result);
            return result;
        }
        requestBody.date_bucket = vaUtils.getBucketType(vaUtils.getDays(from_date, to_date));
        var results = AnalyticsServiceInvoker.invoke("Session", "getAnalyticsTotalSessionsByDate", requestBody);
        if (vaUtils.isEmpty(results)) {
            return result;
        }
        results = vaUtils.addMissingDates(requestBody.from_date, requestBody.to_date, results, requestBody.date_bucket);
        result.chartData = vaUtils.transformTimeSeries(results)

        CIAnalyticsLogger.getLogger('VADashboardMetrics').debugJson('getConversationChartData result - {}', result);
        return result;
    },
    getConversationTrend: function(from_date, to_date) {
        var vaUtils = new sn_ci_analytics.VADashboardUtils();
        var previousSessions = this.getSessionsCount(from_date, to_date).totalSessions;
        var timeSeriesData = this.getConversationChartData(from_date, to_date).chartData;
        var currentSessions = 0;
        if (timeSeriesData.length) {
            currentSessions = timeSeriesData.reduce(function(a, b) {
                return a + b['y0'];
            }, 0);
        }

        var response = {
            totalSessions: currentSessions.toString(),
            change: vaUtils.getChangeInfoTextForScoreCard(currentSessions, previousSessions),
            chartData: timeSeriesData
        };
        return response;
    },

    getVASuccessTrend: function(from_date, to_date) {
        var vaUtils = new sn_ci_analytics.VADashboardUtils();
        if (!vaUtils.isValidDate(from_date) || !vaUtils.isValidDate(to_date)) {
            return {
                'selfSolveRate': '0%',
                'change': ''
            };
        }
        //Convert string date in format YYYY-MM-DD to a date object
        var SELF_SOLVE = 'Self Solve';

        var getSelfSolveRate = function(response) {
            var selfSolveData = response && response[SELF_SOLVE];
            if (selfSolveData) {
                var selfSolvedCount = selfSolveData['true'] || 0;
                var totalSolvedCount = selfSolveData['false'] ? selfSolvedCount + selfSolveData['false'] : selfSolvedCount;
                if (totalSolvedCount === 0) {
                    return {
                        totalSolvedCount: totalSolvedCount,
                        selfSolvedCount: selfSolvedCount,
                    };
                }
                return totalSolvedCount ? (selfSolvedCount / totalSolvedCount) : 0;
            } else {
                return 0;
            }
        };

        var getSelfSolveCount = function(response) {
            var selfSolveData = response && response[SELF_SOLVE];
            if (selfSolveData) {
                var selfSolvedCount = selfSolveData['true'] || 0;
                return selfSolvedCount;
            } else {
                return 0;
            }
        };

        var getRequestBody = function(fromDate, toDate) {
            var requestBody = {};
            requestBody.from_date = fromDate;
            requestBody.to_date = toDate;
            requestBody.platform = 'chat';
            requestBody.property_name_filter = SELF_SOLVE;
            return requestBody;
        };


        var requestBody = getRequestBody(from_date, to_date);
        var response = AnalyticsServiceInvoker.invoke("Session", "getAnalyticsSessionDynamicPropertyValues", requestBody);
        response = response || {};
        var currentSelfSolveRate = getSelfSolveRate(response);
        var currentSelfSolveCount = getSelfSolveCount(response);
        var currSelfSolvePercentage = vaUtils.toPercentageDisplayValue(currentSelfSolveRate);

        // Get previous stats
        var previousPeriod = vaUtils.getPreviousPeriod(from_date, to_date);
        requestBody.from_date = previousPeriod.fromDate;
        requestBody.to_date = previousPeriod.toDate;
        response = AnalyticsServiceInvoker.invoke("Session", "getAnalyticsSessionDynamicPropertyValues", requestBody);
        response = response || {};
        var previousSelfSolveRate = getSelfSolveRate(response);
        var previousSelfSolveCount = getSelfSolveCount(response);

        var changeInfo = '';
        var difference = Math.abs(currentSelfSolveCount - previousSelfSolveCount);
        if (difference > 0) {
            changeInfo = vaUtils.numFormatter(difference) + '';
            var selfSolveRateDiff = Math.abs(currentSelfSolveRate - previousSelfSolveRate);
            if (previousSelfSolveRate > 0 && selfSolveRateDiff > 0) {
                var percentageChange = vaUtils.getDiffInPercentage(currentSelfSolveRate, previousSelfSolveRate);
                var symbol = percentageChange.includes('-') ? '' : '+';
                changeInfo += ' (' + symbol + percentageChange + ')';
            }
        }

        var output = {
            'selfSolveRate': currSelfSolvePercentage,
            'change': changeInfo
        };

        CIAnalyticsLogger.getLogger('VADashboardMetrics').debugJson('getVASuccessTrend result - {}', output);

        return output;
    },


    _getMetricCount: function(startDate, endDate) {
        var count = 0;
        var ga = new GlideAggregate("ssa_deflection_metric");
        var query = "deflection_pattern.deflection_configuration.activity_context=7b43fb645383201033cdddeeff7b1246" + "^sys_created_onBETWEENjavascript:gs.dateGenerate('" + startDate + "','00:00:00')@javascript:gs.dateGenerate('" + endDate + "','23:59:59')";
        ga.addEncodedQuery(query, true);
        ga.addAggregate('COUNT');
        ga.query();
        if (ga.next())
            count = parseInt(ga.getAggregate('COUNT'));
        return count;
    },
    _getRecordsTrend: function(startDate, endDate) {
        var ga = new GlideAggregate("ssa_deflection_metric");
        var query = "deflection_pattern.deflection_configuration.activity_context=7b43fb645383201033cdddeeff7b1246" + "^sys_created_onBETWEENjavascript:gs.dateGenerate('" + startDate + "','00:00:00')@javascript:gs.dateGenerate('" + endDate + "','23:59:59')";
        ga.addEncodedQuery(query, true);
        ga.addAggregate('COUNT');
        ga.addTrend('sys_created_on', 'date');
        ga.query();
        var recordsTrend = {};
        while (ga.next()) {
            var date = new GlideDateTime(ga.getValue("timeref")).getDate();
            recordsTrend[date] = parseInt(ga.getAggregate('COUNT'));
        }
        return recordsTrend;
    },
    _generateChartData: function(startDate, endDate, vaUtils) {
        var deflectionTrendSeries = this._getRecordsTrend(startDate, endDate);
        if (vaUtils.isEmpty(deflectionTrendSeries)) return [];
        var dateBucket = vaUtils.getBucketType(vaUtils.getDays(startDate, endDate));
        deflectionTrendSeries = vaUtils.addMissingDates(startDate, endDate, deflectionTrendSeries, dateBucket);
        var result = vaUtils.transformTimeSeries(deflectionTrendSeries);
        return result || [];
    },

    getDeflectionTrend: function(startDate, endDate) {
        try {
            var result = {
                total_deflection_metrics_count: 0,
                change: '',
                chartData: []
            };

            var vaUtils = new sn_ci_analytics.VADashboardUtils();
            if (!vaUtils.isValidDate(startDate) || !vaUtils.isValidDate(endDate)) {
                return result;
            }

            var previousPeriod = vaUtils.getPreviousPeriod(startDate, endDate);

            var currentMetricCount = this._getMetricCount(startDate, endDate);
            var previousMetricCount = this._getMetricCount(previousPeriod.fromDate, previousPeriod.toDate);
            var changeText = vaUtils.getChangeInfoTextForScoreCard(currentMetricCount, previousMetricCount);

            result = {
                total_deflection_metrics_count: currentMetricCount + '',
                change: changeText,
                chartData: this._generateChartData(startDate, endDate, vaUtils)
            };

            return result;
        } catch (e) {
            var message = "VADashboardMetrics: Exception while fetching deflection metric count " + e.message;
            if (e.stack)
                message = message + "\n" + e.stack;
            CIAnalyticsLogger.getLogger('VADashboardMetrics').error(message);
        }
    },


    sortEachCategoryTopicData: function(refMap, key) {
        var occurance = Object.keys(refMap[key]);
        var refMapObj = refMap[key];
        occurance.sort();
        occurance.reverse();
        var results = [];
        for (var i = 0; i < occurance.length; i++) {
            results = results.concat(refMapObj[occurance[i]]);
        }
        return results;
    },

    getTopicData: function(startDate, endDate) {
        var body = {
            from_date: startDate,
            to_date: endDate,
            event_type_filter: "Topic"
        };

        var response = AnalyticsServiceInvoker.invoke("Event", "getAnalyticsEventPropertyValues", body);
        response = response && response[body.event_type_filter];
        var results = {
            all: {},
            underperformed_topics: {},
            not_completed: {},
        };

        var getOccurrenceCount = function(data) {
            for (var i in data) return data[i];
        };

        for (var topic in response) {
            var topicData = response[topic];
            var subCategory = topicData && topicData['Sub Category'];
            if (subCategory && subCategory['STANDARD']) {
                var topicId = topicData['Topic Id'];

                var occurrenceCount = topicId && getOccurrenceCount(topicId);
                var lastNodeVisited = topicData['Last Node Visited'];
                var liveAgentTransfer = topicData['Live Agent Transfer'];
                var completedCount = lastNodeVisited && lastNodeVisited['true'];
                var notCompletedCount = lastNodeVisited && lastNodeVisited['false'];
                var liveAgentTransferCount = liveAgentTransfer && liveAgentTransfer['true'];
                var record = {
                    topic_name: topic,
                    occurrence: occurrenceCount,
                    completed: completedCount,
                    not_completed: notCompletedCount,
                    live_agent_transferred: liveAgentTransferCount
                };
                if (results.all[occurrenceCount]) {
                    results.all[occurrenceCount].push(record)
                } else {
                    results.all[occurrenceCount] = [record];
                }
                if (liveAgentTransferCount && results.underperformed_topics[liveAgentTransferCount]) {
                    results.underperformed_topics[liveAgentTransferCount].push(record)
                } else if (liveAgentTransferCount) {
                    results.underperformed_topics[liveAgentTransferCount] = [record];
                }

                if (notCompletedCount && results.not_completed[notCompletedCount]) {
                    results.not_completed[notCompletedCount].push(record)
                } else if (notCompletedCount) {
                    results.not_completed[notCompletedCount] = [record];
                }

            }
        };

        var result = {
            idle_topics: this.sortEachCategoryTopicData(results, 'all'),
            underperformed_topics: this.sortEachCategoryTopicData(results, 'underperformed_topics'),
            not_completed: this.sortEachCategoryTopicData(results, 'not_completed'),
        };

        return result;

    },

    getEventsData: function(startDate, endDate, cardType, limit) {
        var result = this.getTopicData(startDate, endDate);
        var topItems = [];
        if (cardType == "topics_transferred_to_human_agent") {
            for (var i = 0; i < limit; i++) {
                if (result.underperformed_topics[i] && result.underperformed_topics[i].topic_name && result.underperformed_topics[i].live_agent_transferred) {
                    var topic = {};
                    topic.title = result.underperformed_topics[i].topic_name;
                    topic.count = result.underperformed_topics[i].live_agent_transferred;
                    topItems.push(topic);
                }

            }

        }

        if (cardType == "topics_not_completed_by_user") {
            for (var i = 0; i < limit; i++) {
                if (result.not_completed[i] && result.not_completed[i].topic_name && result.not_completed[i].not_completed) {
                    var topic = {};
                    topic.title = result.not_completed[i].topic_name;
                    topic.count = result.not_completed[i].not_completed;
                    topItems.push(topic);
                }
            }

        }

        if (cardType == "topics_least_used") {

            if (result.idle_topics) {
                result.idle_topics.reverse();
                for (var i = 0; i < limit; i++) {
                    if (result.idle_topics[i] && result.idle_topics[i].topic_name) {
                        var topic = {};
                        topic.title = result.idle_topics[i].topic_name;
                        topItems.push(topic);
                    }
                }
            }


        }
        return topItems;

    },

    type: 'VADashboardMetrics'
};
