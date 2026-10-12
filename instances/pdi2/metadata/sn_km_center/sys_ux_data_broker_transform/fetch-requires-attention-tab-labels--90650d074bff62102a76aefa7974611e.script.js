function transform(input) {
    var translatedTabLabels = input.translatedTabLabels;
    var tabs = [];
    var tabLabelToCount = {};

    var pluginManager = new GlidePluginManager();

    if (!translatedTabLabels || Object.keys(translatedTabLabels).length === 0) {
        return;
    }

    // Define tab queries 
    var tabConfigs = [{
            labelKey: "Articles expiring in 90 days",
            table: "kb_knowledge",
            query: "valid_toRELATIVELT@dayofweek@ahead@90^valid_to>=javascript:gs.beginningOfToday()^active=true^workflow_stateNOT INretired,outdated"
        },
        {
            labelKey: "My Feedback Tasks",
            table: "kb_feedback_task",
            query: "stateNOT IN6,3^assigned_to=" + gs.getUserID()
        },
        {
            labelKey: "My Approvals",
            table: "sysapproval_approver",
            custom: function() {
                var gr = new GlideRecordSecure("sysapproval_approver");
                var tables = new GlideTableHierarchy('kb_knowledge').getAllExtensions();
                var customAccessibleCount = 0;
                gr.addQuery('source_table', 'IN', tables);
                gr.addQuery('state', '=', 'requested');
                gr.addQuery('approver', '=', gs.getUserID());
                gr.query();
                
                while (gr.next()) {
                    if (gr.canRead()) {
                        customAccessibleCount++;
                    }
                }
                return customAccessibleCount;
            }
        },
        {
            labelKey: "My Pending Group Requests",
            table: "sc_req_item",
            query: "opened_by=" + gs.getUserID() + "^cat_item=00766c3c67271300dbfdbb2d07415ae8^state!=3^approval=requested"
        },
        {
            labelKey: "My Flagged",
            table: "kb_knowledge",
            query: "author=" + gs.getUserID() + "^flagged=true"
        }
    ];

    if (pluginManager.isActive("com.glide.localization_framework")) {
        tabConfigs.push({
            labelKey: "My Translation Requests",
            table: "sn_lf_requested_item",
            query: "requested_by=" + gs.getUserID() + "^state=1"
        });
    }

	if (!pluginManager.isActive("com.sn.km.gen.ai")) {
		tabConfigs.push({
			labelKey: "My Article Optimization",
            table: "kb_knowledge",
            custom: function () {
				var tables = new GlideTableHierarchy('kb_knowledge').getAllExtensions();

				var ga = new GlideAggregate('kb_assist_scan_result');
				ga.addQuery('state', 'open');
				ga.addAggregate('COUNT(DISTINCT', 'target_record');
				ga.addQuery('target_table', 'IN', tables);

				// one row per KB article
				ga.groupBy('target_record');
				ga.query();

				var kbSysIds = [];
				while (ga.next()) {
					kbSysIds.push(ga.getValue('target_record'));
				}

				var kbCount = 0;

				if (kbSysIds.length > 0) {
					var kbAgg = new GlideAggregate('kb_knowledge');
					kbAgg.addQuery('sys_id', 'IN', kbSysIds.join(','));
					kbAgg.addQuery('author', gs.getUserID());
					kbAgg.addEncodedQuery('workflow_stateNOT INretired,outdated');

					kbAgg.addAggregate('COUNT');
					kbAgg.query();

					if (kbAgg.next()) {
						kbCount = parseInt(kbAgg.getAggregate('COUNT'), 10);
					}
				}
				return kbCount;

			}
		});
	}

    // pending AQI checklist request should be visible where reviewer has admin/knowldge_admin/knowledge_coach/knowledge_domain_expert role and when advanced plugin is installed
    if (pluginManager.isActive("com.snc.knowledge_advanced") && (gs.hasRole("knowledge_admin") || gs.hasRole("knowledge_coach") || gs.hasRole('knowledge_domain_expert'))) {
        tabConfigs.push({
            labelKey: "My Article Checklist (AQI)",
            table: "kb_article_checklist_summary",
            query: "reviewer=" + gs.getUserID() + "^state!=submitted"
        });
    }

    // Loop through configs
    for (var i = 0; i < tabConfigs.length; i++) {
        var cfg = tabConfigs[i];
        var accessibleCount = 0;
        if (cfg.custom) {
            accessibleCount = cfg.custom();
        } else {
            var gr = new GlideRecordSecure(cfg.table);
			gr.addEncodedQuery(cfg.query, true);
            gr.query();
            while (gr.next()) {
                if (gr.canRead()) {
                    accessibleCount++;
                }
            }
        }
        tabs.push({
            label: translatedTabLabels[cfg.labelKey],
            count: accessibleCount
        });
        tabLabelToCount[cfg.labelKey] = accessibleCount;
    }

    // Only add tabs with a count above zero
    var filteredTabs = tabs.filter(function(tab) {
        return tab.count > 0;
    });

    // Filter and sort tabs in descending order of count
    filteredTabs.sort(function(a, b) {
        return b.count - a.count;
    });

    // sortedResults provides the sorted arrayby count for repeater input to tabs component
    // resultsDictionary provides access to the count for each tab for elements on the page
    return {
        sortedResults: filteredTabs,
        resultsDictionary: tabLabelToCount
    };
}
