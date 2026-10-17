function transform(input) {
    var jsonResponse = {};
    var tableName = input.tableName;

    if (!tableName)
        return jsonResponse;

    var statsAPI = new SNC.StorageStatsAPI();
    var stats = JSON.parse(statsAPI.getTableStorageUsageStats(tableName));
    var tableStats = {storageUnit: 'GB'};
    if (stats != null) {
        var size = stats.size;
        var isTB = size >= 1024;
        tableStats.storageUnit = isTB ? "TB" : "GB";
        size = isTB ? size / 1024 : size;

        tableStats.size = Number.isInteger(size) ? Math.floor(size) : size.toFixed(2);

        var growthPercent = stats.growthPercent;
        tableStats.growthPercent = Number.isInteger(growthPercent) ? Math.floor(growthPercent) : growthPercent.toFixed(2);

        tableStats.baseScoreDate = new GlideDateTime(stats.baseDate).getNumericValue();
        tableStats.baseDate = new GlideDateTime(stats.baseDate).getDisplayValueLang("MEDIUM");
        tableStats.trends = stats.trends;
        tableStats.metadata = stats.metadata;
    }

    jsonResponse.tableStats = tableStats;

    return jsonResponse;
}
