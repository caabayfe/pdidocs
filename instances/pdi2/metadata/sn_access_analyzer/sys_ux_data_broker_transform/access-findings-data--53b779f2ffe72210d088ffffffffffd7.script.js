function transform(input) {
    const UPDATES_VIEW = {
        ALL_UPDATES_CONFIG: {
            "tabSetsConfig": []
        },
        ENCODED_QUERIES_WITH_LABELS: [{
                "label_for_tabs": gs.getMessage("Open"),
                "query": "status=open"
            },
            {
                "label_for_tabs": gs.getMessage("Muted"),
                "query": "status=muted"
            },
            {
                "label_for_tabs": gs.getMessage("Resolved"),
                "query": "status=resolved"
            }
        ]
    };
    var statusTabSetConfig = [];
    var allUpdatesConfig = UPDATES_VIEW.ALL_UPDATES_CONFIG;
    var encodedQueriesWithLabels = UPDATES_VIEW.ENCODED_QUERIES_WITH_LABELS;
    encodedQueriesWithLabels.forEach(function(encodedQueryWithLabel, index) {
        var gr = new GlideRecord("sn_access_analyzer_access_finding");
        gr.addEncodedQuery(encodedQueryWithLabel["query"]);
        gr.query();
        statusTabSetConfig.push({
            "label": encodedQueryWithLabel["label_for_tabs"],
            "count": gr.getRowCount(),
	    "query": encodedQueryWithLabel["query"]
        });
    });
    allUpdatesConfig.tabSetsConfig = statusTabSetConfig;
    return allUpdatesConfig;
}
