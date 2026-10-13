if (gs.getProperty('glide.discovery.shazzaminsights', false) == 'true') {
    try {
        var shazzamInsights = new ShazzamInsights(current);
        shazzamInsights.processShazzamInsights();
    } catch (e) {
        var errMsg = 'Exception while processing Shazzam Insights: ' + e.toString();
        gs.error(errMsg);
    }
}
