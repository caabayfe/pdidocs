function transform(input) {
    var jsonResponse = {};
    var statsAPI = new SNC.StorageStatsAPI();
    const tableCount = 10;
    const minSizeInGB = 10.0;
    const decimals = 2;
    const tablesWithGrowth = JSON.parse(statsAPI.getTopTablesByGrowth(tableCount, minSizeInGB));
	const topTablesByGrowthStats = tablesWithGrowth.topGrowing;
    const topGrowingRowDefinition = {};
    topGrowingRowDefinition.rows = [];
    
	function getGrowthPercent(table) {
        if (isNaN(table.growthPercent) || !Number.isFinite(table.growthPercent))
            return Number.MAX_SAFE_INTEGER + "%";

        const growth = table.growthPercent.toFixed(2);
        const sign = growth > 0 ? "+" : "";
        return sign + growth + "%";
    }

    topTablesByGrowthStats.forEach((tableStat) => {
        let symbol = "";
        if (parseFloat(tableStat.growthPercent) >= 0) {
            symbol = "+";
        }

        topGrowingRowDefinition.rows.push({
            "cells": {
                "associatedSize": {
                    "value": parseFloat(tableStat.associatedRecordsSize).toFixed(decimals)
                },
                "growth": {
                    "value": getGrowthPercent(tableStat)
                },
                "size": {
                    "value": parseFloat(tableStat.size).toFixed(decimals)
                },
                "table": {
                    "value": tableStat.label,
                    "tableName": tableStat.name
                }
            },
            "key": tableStat.name
        });
    });

    jsonResponse.top10GrowingRowDefinition = topGrowingRowDefinition;
	jsonResponse.allTables = tablesWithGrowth.allTables;
    return jsonResponse;
}
