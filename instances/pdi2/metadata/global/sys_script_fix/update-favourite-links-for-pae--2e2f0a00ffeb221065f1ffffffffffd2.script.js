gs.info('Before - Updating Favourite links for PAE');
updateFavouriteLinksForPAE();
gs.info('After - Updating Favourite links for PAE');

function updateFavouriteLinksForPAE() {
    if (pm.isZboot())
        return;
    var gr = new GlideRecord("sys_ui_bookmark");
    gr.addEncodedQuery('urlLIKEnow/platform-analytics-workspace/dashboard-library^ORurlLIKEnow/platform-analytics-workspace/data-visualization-library^ORurlLIKEnow/platform-analytics-workspace/indicator-management^ORurlLIKEnow/platform-analytics-workspace/filter-library^ORurlLIKEnow/platform-analytics-workspace/scheduled-export-library^ORurlLIKEnow/platform-analytics-workspace/analytics-center-home');
    gr.query();
    
    var replacements = {
        "dashboard-library/params": "pages/params/library/dashboards",
        "data-visualization-library/params": "pages/params/library/data-visualizations",
        "dashboard-library": "pages/params/library/dashboards",
        "indicator-management": "pages/params/library/indicators",
        "data-visualization-library": "pages/params/library/data-visualizations",
        "filter-library": "pages/params/library/filters",
        "scheduled-export-library": "pages/params/library/scheduled-exports",
        "analytics-center-home": "pages/params/library/overview"
    };
    while (gr.next()) {
        var url = gr.getDisplayValue("url");
        for (var key in replacements) {
            if (url.includes(key)) {
                url = url.replace(key, replacements[key]);
                break; // Stop after first match
            }
        }
        gr.setDisplayValue("url", url);
        gr.update();
    }
    gr.close();
}
