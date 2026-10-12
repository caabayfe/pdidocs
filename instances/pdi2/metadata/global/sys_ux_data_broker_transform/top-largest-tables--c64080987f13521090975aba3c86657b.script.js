function transform(input) {
    var jsonResponse = {};
    const statsAPI = new SNC.StorageStatsAPI();
    const tableCount = 10;
    const decimals = 2;
    const topTablesBySizeStats = JSON.parse(statsAPI.getTopTablesBySize(tableCount));
    const topLargestRowDefinition = {};
    topLargestRowDefinition.rows = [];

    topTablesBySizeStats.forEach((tableStat) => {
        topLargestRowDefinition.rows.push({
            "cells": {
                "associatedSize": {
                    "value": parseFloat(tableStat.associatedRecordsSize).toFixed(decimals)
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

    jsonResponse.top10LargestRowDefinition = topLargestRowDefinition;


    // Get name of top ten tables and pass to storage trend api to get trends
    var tableNames = topTablesBySizeStats.map(stat => stat.name);
    var trends = JSON.parse(statsAPI.getStorageUsageTrend(tableNames));

    jsonResponse.top10LargestTableTrend = trends ?? [];

    return jsonResponse;
}
