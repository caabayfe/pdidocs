function transform(input) {
    var vaUtils = new sn_ci_analytics.VADashboardUtils();
    var searchMetricsUtils = new sn_ci_analytics.CAPARUserSearchMetrics();
    if (!vaUtils.isValidDate(input.startDate) || !vaUtils.isValidDate(input.endDate)) {
        return {
            'colsInfo': {},
            'rowsInfo': {}
        };
    }

    function getColumns() {
        return {
            "columns": [{
                    "key": "colKey1",
                    "type": "string",
                    "label": input.name
                },
                {
                    "key": "colKey2",
                    "type": "number",
                    "label": "Total %"
                }
            ]
        }
    }
    var payload = {
        indicatorId: input.indicatorId,
        breakdownId: input.breakdownId,
        startDate: input.startDate,
        endDate: input.endDate,
        pageNumber: input.pageNumber,
        pageSize: input.pageSize
    };
    var response = searchMetricsUtils.fetchBreakdownScores(payload);

    function getRows(response) {
        var rows = [];
        response.breakdowns.forEach(function(obj) {
            rows.push({
                "key": obj.breakdown,
                "cells": {
                    "colKey1": {
                        "value": obj.breakdown
                    },
                    "colKey2": {
                        "value": obj.percentage
                    }
                }
            });
        });
        return {
            "rows": rows
        };
    }
    var output = {
        'colsInfo': getColumns(),
        'rowsInfo': getRows(response),
        'totalBreakdowns': response.totalBreakdowns
    };
    CIAnalyticsLogger.getLogger('ConversationSelfSolveRate').debugJson('Data broker result - {}', output);

    return output;
}
