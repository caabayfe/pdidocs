function transform(input) {
    var jsonResponse = {};
    var tableName = input.tableName;
    if (tableName == null)
        return jsonResponse;

    var statsAPI = new SNC.StorageStatsAPI();

    const driverTables = JSON.parse(statsAPI.getDriverTables(tableName));
    const decimals = 2;
    const driverTableRows = {};
    driverTableRows.rows = [];

    driverTables.forEach((tableStat) => {
        driverTableRows.rows.push({
            "cells": {
                "relatedRecords": {
                    "value": Math.round(parseFloat(tableStat.rowCount) * 1000)
                },
                "relatedSize": {
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
    jsonResponse.driverTableRows = driverTableRows;

    return jsonResponse;
}
