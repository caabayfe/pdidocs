function transform(input) {
    var jsonResponse = {
        associatedTableStats: {
			storageUnit: 'GB'
		},
        associatedTableRows: {
            rows: []
        }
    };

    const tableName = input.tableName;

    if (!tableName) {
        return {};
    }

    const statsAPI = new SNC.StorageStatsAPI();

    const stats = JSON.parse(statsAPI.getAssociatedTablesUsageStats(tableName));
    if (stats) {
        var size = stats.size;
        var isTB = size >= 1024;
        stats.storageUnit = isTB ? "TB" : "GB";
        size = isTB ? size / 1024 : size;

        stats.size = Number.isInteger(size) ? Math.floor(size) : size.toFixed(2);

        var growthPercent = stats.growthPercent;
        stats.growthPercent = Number.isInteger(growthPercent) ? Math.floor(growthPercent) : growthPercent.toFixed(2);

        stats.baseScoreDate = new GlideDateTime(stats.baseDate).getNumericValue();
        stats.baseDate = new GlideDateTime(stats.baseDate).getDisplayValueLang("MEDIUM");
        jsonResponse.associatedTableStats = stats;
    }


    // Get Associated Tables List 
    const associatedTablesList = JSON.parse(statsAPI.getAssociatedTablesStats(tableName));
    associatedTablesList.forEach((stats) => {
        jsonResponse.associatedTableRows.rows.push({
            "cells": {
                "associatedRecords": {
                    "value": parseFloat(stats.rowCount) * 1000
                },
                "associatedSize": {
                    "value": parseFloat(stats.size).toFixed(2)
                },
                "table": {
                    "value": stats.label,
                    "tableName": stats.name
                }
            },
            "key": stats.name
        });
    });

    return jsonResponse;
}
