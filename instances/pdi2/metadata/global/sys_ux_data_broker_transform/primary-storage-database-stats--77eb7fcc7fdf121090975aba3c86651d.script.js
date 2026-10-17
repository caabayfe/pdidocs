function transform(input) {
    var api = new SNC.StorageStatsAPI();
    var stats = JSON.parse(api.getPrimaryStorageUsageStats());

    if (stats) {
        var size = stats.size;
        var isTB = size >= 1024;
        stats.storageUnit = isTB ? "TB" : "GB";
        size = isTB ? size / 1024 : size;

        stats.size = Number.isInteger(size) ? Math.floor(size) : size.toFixed(2);

        var growthPercent = stats.growthPercent;
        stats.growthPercent = Number.isInteger(growthPercent) ? Math.floor(growthPercent) : growthPercent.toFixed(2);

        stats.baseScoreDate = new GlideDateTime(stats.baseDate).getNumericValue();
        stats.collectionScoreDate = new GlideDateTime(stats.collectionDate).getNumericValue();

        stats.collectionDate = new GlideDateTime(stats.collectionDate).getDisplayValueLang("MEDIUM");
        stats.baseDate = new GlideDateTime(stats.baseDate).getDisplayValueLang("MEDIUM");

        return stats;
    } 
    return {storageUnit: "GB"};    
}
