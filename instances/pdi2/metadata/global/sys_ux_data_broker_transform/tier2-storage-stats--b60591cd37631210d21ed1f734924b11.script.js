function transform() {
    if (!GlidePluginManager.isActive("com.glide.db.columnar.archive")) {
        return {
            isDisabled: true,
            stats: {}
        };
    }
    const api = new SNC.StorageStatsAPI();
    let stats = JSON.parse(api.getTier2StorageUsageStats());

    if (stats) {
        var size = stats.size;
        var isTB = size >= 1024;
        stats.storageUnit = isTB ? "TB" : "GB";
        size = isTB ? size / 1024 : size;

        stats.size = Number.isInteger(size) ? Math.floor(size) : size.toFixed(2);
        stats.growthPercent = Number.isInteger(stats.growthPercent) ? Math.floor(stats.growthPercent) : stats.growthPercent.toFixed(2);
        stats.baseScoreDate = new GlideDateTime(stats.baseDate).getNumericValue();
        stats.collectionDate = new GlideDateTime(stats.collectionDate).getDisplayValueLang("MEDIUM");
        stats.baseDate = new GlideDateTime(stats.baseDate).getDisplayValueLang("MEDIUM");
    } else {
        stats = { storageUnit:"GB" };
    }

    return {
        isDisabled: false,
        stats
    };
}
