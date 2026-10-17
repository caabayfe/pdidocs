function transform(input) {
    var result = {};
    var autoResolutionEnabled = false;
    var enabled = gs.getProperty("com.glide.cs.enable_auto_resolution");
    if (enabled) {
        var gr = new GlideRecord("sys_cs_auto_resolution_configuration");
        gr.addActiveQuery();
        gr.query();
        if (gr.hasNext())
            autoResolutionEnabled = true;
    }

    result = {
        "navItems": [{
                "id": "overview",
                "label": gs.getMessage("Overview"),
                "icon": "window-outline"
            },
            {
                "id": "usage",
                "label": gs.getMessage("Usage"),
                "icon": "analytics-center-outline"
            },
            {
                "id": "conversations",
                "label": gs.getMessage("Conversations"),
                "icon": "chat-outline"
            },
            {
                "id": "users",
                "label": gs.getMessage("Users"),
                "icon": "user-group-outline"
            },
            {
                "id": "topics",
                "label": gs.getMessage("Topics"),
                "icon": "tree-view-short-outline",
                "children": [{
                        "id": "category",
                        "label": gs.getMessage("Category"),
                        "icon": "venn-empty-outline"
                    },
                    {
                        "id": "topic-details",
                        "label": gs.getMessage("Topic Details"),
                        "icon": "text-outline"
                    },
                    {
                        "id": "spoke",
                        "label": gs.getMessage("Spokes"),
                        "icon": "outage-planned-outline"
                    }
                ]
            },
            {
                "id": "nlu-prediction",
                "label": gs.getMessage("NLU Prediction"),
                "icon": "lightbulb-outline"
            },
            {
                "id": "search-metrics",
                "label": gs.getMessage("User Search Metrics"),
                "icon": "window-outline"

            },
            {
                "id": "custom-events",
                "label": gs.getMessage("Custom Events"),
                "icon": "script-outline"
            },
            {
                "id": "funnels",
                "label": gs.getMessage("Funnels"),
                "icon": "filter-outline"
            }
        ],
        "selectedNavItems": [
            [
                "overview"
            ]
        ],
        "isAutoResolutionEnabled": autoResolutionEnabled,
        "expandedNavItems": []
    };

    if (autoResolutionEnabled) {
        result.navItems.push({
            "id": "issue-auto-resolution",
            "label": gs.getMessage("Issue Auto-Resolution"),
            "icon": "headset-outline"
        });
    }

    return result;
}
