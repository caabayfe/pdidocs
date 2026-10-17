(function() {
    var DOWNLOADER_CLASS = 'UsageInsightsEventDownloader';
    try {
        gs.info('[' + DOWNLOADER_CLASS + '] Starting event download process');
        var success = new UsageEventsDownloader().downloadAndProcessResult();
        gs.info('[' + DOWNLOADER_CLASS + '] Result: ' + success);
    } catch (e) {
        gs.warn('[' + DOWNLOADER_CLASS + '] Exception: ' + e.message);
    }
})();
