var VaAdminConsoleMetrics = Class.create();
VaAdminConsoleMetrics.prototype = {

    initialize: function() {
        this.POSITIVE_TREND_COLOR = "49, 163, 84";
        this.NEGATIVE_TREND_COLOR = "222, 45, 38";
        this.DEFAULT_TREND_COLOR = "0,0,0";
    },

    getConversations: function(startDate, endDate) {
        if (sn_ci_analytics && sn_ci_analytics.VADashboardMetrics) {
            var _result = new sn_ci_analytics.VADashboardMetrics().getConversationTrend(startDate, endDate);
            return this.getPARFormattedData("totalSessions", _result, startDate);
        }
    },

    getActiveUsers: function(startDate, endDate) {
        if (sn_ci_analytics && sn_ci_analytics.VADashboardMetrics) {
            var _result = new sn_ci_analytics.VADashboardMetrics().getActiveUsersTrend(startDate, endDate);
            return this.getPARFormattedData("totalUsers", _result, startDate);
        }
    },

    getDeflections: function(startDate, endDate) {
        if (sn_ci_analytics && sn_ci_analytics.VADashboardMetrics) {
            var _result = new sn_ci_analytics.VADashboardMetrics().getDeflectionTrend(startDate, endDate);
            return this.getPARFormattedData("total_deflection_metrics_count", _result, startDate);
        }
    },

    getVASuccessTrend: function(startDate, endDate) {
        if (sn_ci_analytics && sn_ci_analytics.VADashboardMetrics) {
            var _result = new sn_ci_analytics.VADashboardMetrics().getVASuccessTrend(startDate, endDate);
            if (_result && _result.selfSolveRate) {
                _result.selfSolveRate = parseFloat(_result.selfSolveRate);
            }
            return this.getPARFormattedData("selfSolveRate", _result, startDate);
        }
    },

    getPARFormattedData: function(type, data, startDate) {

        var cData = {
            type: type
        };
        var chartData = data.chartData || [];
        for (var i = 0; i < chartData.length; i++) {
            chartData[i].value = chartData[i].y0;
        }
        cData.chartData = chartData;

        if (!data.change) {
            cData.changeArrow = "steady";
        } else if (data.change && data.change.includes("-")) { //negativeValueIndicator
            cData.changeArrow = "down";
            //cData.changeColor = this.NEGATIVE_TREND_COLOR;
            cData.sparklineColor = this._getSparkLineColor("negative") || this.DEFAULT_TREND_COLOR;
        } else {
            cData.changeArrow = "up";
            //cData.changeColor = this.POSITIVE_TREND_COLOR;
            cData.sparklineColor = this._getSparkLineColor("positive") || this.DEFAULT_TREND_COLOR;
        }

        cData.value = this._numFormatter(data[type] || 0);
        if (data.change && data.change.includes("(") & data.change.includes("%")) {
            cData.change = data.change.slice(0, data.change.indexOf("("));
            cData.changePercent = data.change.slice(data.change.indexOf("(") + 1, data.change.indexOf("%"));
        } else {
            cData.change = data.change;
        }

        cData.previousScoreDate = new GlideDateTime(startDate).getNumericValue() + ''; //new GlideDateTime(startDate).getDate().getByFormat('MMM d');

        return this._getPARDataFormat(cData);
    },

    _getPARDataFormat: function(cData) {
        var _title = this._getTitle(cData.type);
        //var _changeWithPercentage = (cData.change || '0') + " " + "(" + (cData.changePercent || '0') + "%" + ")";
        return [{
            "data": [{
                "value": cData.value,
                "change": (cData.change || '0'),
                "changePercent": (cData.changePercent || '0'),
            }],
            "metadata": {
                "dataSourceLabel": _title,
                "previousScoreDate": cData.previousScoreDate,
                "changeArrow": cData.changeArrow || "steady",
                /*"changeColor": {
                    "defaultColor": cData.changeColor || this.DEFAULT_TREND_COLOR
                },*/
                "aggregate": {
                    "fieldType": "decimal"
                },
                "format": {
                    "unitFormat": cData.type == "selfSolveRate" ? "{0}%" : "{0}",
                    "frequency": "daily",
                    "precision": cData.type == "selfSolveRate" ? 1 : 0
                }
            },
            "sparkline": {
                "data": cData.chartData,
                "metadata": {
                    "dataSourceLabel": _title,
                    "series": [{
                        "label": _title,
                        "id": "value",
                        "type": "value"
                    }],
                    "aggregate": {
                        "fieldType": "decimal"
                    },
                    "format": {
                        "unitFormat": "{0}",
                        "frequency": "daily",
                        "precision": 0
                    }
                }
            },
            "sparklineColor": cData.sparklineColor
        }];

    },

    _getTitle: function(type) {
        if (type == "totalSessions") {
            title = gs.getMessage("Conversations");
        } else if (type == "totalUsers") {
            title = gs.getMessage("Active VA users");
        } else if (type == "total_deflection_metrics_count") {
            title = gs.getMessage("Issues deflected");
        } else if (type == "selfSolveRate") {
            title = gs.getMessage("Virtual Agent success");
        }
        return title;
    },

    _numFormatter: function(num) {
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

    _getSparkLineColor: function(type) {
        if (type == "negative") {
            return {
                "type": "palette",
                "palette": "fe069951d7100200b96d45a3ce6103c9"
            };
        } else if (type == "positive") {
            return {
                "type": "palette",
                "palette": "08e1d719d7100200b96d45a3ce610375"
            };
        }

        return {};
    },

    getLeastUsedTopics: function() {
        if (sn_ci_analytics) {
            var startDate = new GlideDateTime(gs.daysAgo(30)).getDate().toString();
            var endDate = new GlideDateTime().getDate().toString();
            var payload = {
                "uuid": "d12820d2775142109cc2da3ccd5a99d0",
                "breakdownId": "51cca08977a00210dfe21f130e5a9991",
                startDate,
                endDate,
            };
            var scoreCard = this._queryPARScoreCard(payload);
            var topicScoreMap = this._getTotalScoreOfElements(scoreCard, 1);
            var leastUsedTopics = topicScoreMap.sort((a, b) => a.count - b.count).slice(0, 3);
            return leastUsedTopics;
        }
    },

    getUnderPerformedTopics: function() {
        if (sn_ci_analytics) {
            var startDate = new GlideDateTime(gs.daysAgo(30)).getDate().toString();
            var endDate = new GlideDateTime().getDate().toString();
            var payload = {
                "uuid": "d12820d2775142109cc2da3ccd5a99d0:49108e7977033110dfe21f130e5a9958:c4b8a82577033110dfe21f130e5a9987",
                "breakdownId": "51cca08977a00210dfe21f130e5a9991",
                startDate,
                endDate,
            };
            var scoreCard = this._queryPARScoreCard(payload);
            var topicScoreMap = this._getTotalScoreOfElements(scoreCard, 2);
            var underPerformingTopics = topicScoreMap.sort((a, b) => b.count - a.count).slice(0, 3);
            return underPerformingTopics;
        }
    },

    getNotCompletedTopics: function() {
        if (sn_ci_analytics) {
            var startDate = new GlideDateTime(gs.daysAgo(30)).getDate().toString();
            var endDate = new GlideDateTime().getDate().toString();
            var payload = {
                "uuid": "d12820d2775142109cc2da3ccd5a99d0:a36182f977033110dfe21f130e5a9915:e0a8282577033110dfe21f130e5a9908",
                "breakdownId": "51cca08977a00210dfe21f130e5a9991",
                startDate,
                endDate,
            };
            var scoreCard = this._queryPARScoreCard(payload);
            var topicScoreMap = this._getTotalScoreOfElements(scoreCard, 2);
            var incompleteTopics = topicScoreMap.sort((a, b) => b.count - a.count).slice(0, 3);
            return incompleteTopics;
        }
    },

    _queryPARScoreCard: function(payload) {
        if (gs.nil(payload.uuid))
            return [];
        var pageSize = gs.getProperty('com.snc.pa.dc.max_breakdown_elements_limit', 10000);
        var sc = new PAScorecard();
        var params = {
            uuid: payload.uuid,
            breakdown: payload.breakdownId,
            from: payload.startDate,
            to: payload.endDate,
            include_scores: true,
            per_page: pageSize
        };
        for (var key in params) {
            sc.addParam(key, params[key]);
        }
        return sc.query();
    },

    _getTotalScoreOfElements: function(scoreCard, level) {
        var elements = scoreCard
            .map(function(item) {
                var totalScore = item.scores.reduce(function(sum, score) {
                    return sum + (score.value || 0);
                }, 0);

                if (totalScore > 0) {
                    var title = (level === 2) ? item.element_level2.display_value : item.element.display_value;
                    return {
                        title: title,
                        count: totalScore
                    };
                }

                return null;
            })
            .filter(function(item) {
                return item !== null;
            });
        return elements;
    },

    type: 'VaAdminConsoleMetrics'
};
