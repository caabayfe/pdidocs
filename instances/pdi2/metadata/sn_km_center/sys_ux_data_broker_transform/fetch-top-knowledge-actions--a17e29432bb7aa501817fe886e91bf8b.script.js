function transform(input) {
    const NO_FEATURE_ITEMS = 0;
    const SINGLE_FEATURE_ITEMS = 6;
    const DOUBLE_FEATURE_ITEMS = 3;
    const TRIPLE_FEATURE_ITEMS = 2;
    const DISPLAY_CONFIGURATION = [
        NO_FEATURE_ITEMS,
        SINGLE_FEATURE_ITEMS,
        DOUBLE_FEATURE_ITEMS,
        TRIPLE_FEATURE_ITEMS
    ];

    const TABLES = {
        "isDuplicatesConfigured": "kb_duplicate_articles",
        "isGapsConfigured": "kb_gap_candidates",
        "isArticleOptimizationConfigured": "kb_assist_scan_result"
    };
    const TYPES = {
        "kb_duplicate_articles": gs.getMessage("Duplicates"),
        "kb_gap_candidates": gs.getMessage("Gap"),
        "kb_assist_scan_result": gs.getMessage("Article Optimization")
    };
    const DESCRIPTION_FIELDS = {
        "kb_duplicate_articles": "description",
        "kb_gap_candidates": "group_description",
        "kb_assist_scan_result": "target_record"
    };
    const gapTypes = {
        "incident": gs.getMessage("Incident Gap"),
        "sn_customerservice_case": gs.getMessage("Case Gap"),
        "sn_hr_core_case": gs.getMessage("HR Case Gap")
    };

    // Depending on how many features are active, we will display a certain number of items per feature
    function getItemCount(input) {
        var count = Object.values(configurations).filter(Boolean).length;

        return DISPLAY_CONFIGURATION[count] || NO_FEATURE_ITEMS;
    }

    // Gets task type for gaps query
    function getGapTypeQuery() {
        // If gaps skills are not both active, set task type to the active skill's task type
		// If gaps are both active, then bypass this query param
        // Only scope the query when exactly one domain is configured; if multiple are
        // active, bypass so gaps across all configured domains are returned.
        var configuredTypes = [];
        if (input.isGapsITSMConfigured) configuredTypes.push("incident");
        if (input.isGapsCSMConfigured) configuredTypes.push("sn_customerservice_case");
        if (input.isGapsHRConfigured) configuredTypes.push("sn_hr_core_case");
        var type = configuredTypes.length === 1 ? configuredTypes[0] : undefined;
        return type ? `^task.sys_class_nameINSTANCEOF${type}` : null;
    }

	function canEditArticle(articleGr){
		try{
			var kbKnowledgeAPI = new global.KBKnowledge();
			if(kbKnowledgeAPI.isVersioningEnabled()){
				var kbVersioningAPI = new global.KBVersioning();
				return kbVersioningAPI.canWrite(articleGr) ||  kbVersioningAPI.canCheckout(articleGr);
			}
			return kbKnowledgeAPI.canWrite(articleGr);
		}catch(err){
			gs.error('KnowledgeCenter : Fetch top knowledge actions Data broker error: ' + JSON.stringify(err));
		}
		return false;
	}

    var ACTION_STRATEGY_RESTRICTED_TABLES = ["kb_duplicate_articles", "kb_gap_candidates"];
    function hasActionStrategyAccess() {
        return gs.hasRole("knowledge_admin") || gs.hasRole("knowledge_manager");
    }

    // Gets the item properties given a specific table and item count
    function getItems(table, itemCount) {
        if (ACTION_STRATEGY_RESTRICTED_TABLES.indexOf(table) > -1 && !hasActionStrategyAccess()) {
            return []; // Ineligible session: don't run the action_strategy-gated query at all
        }

        var KB_DUPLICATE_ARTICLES_QUERY = "action_strategy.active=true";
        var KB_GAP_CANDIDATES_QUERY = "action_strategy.active=true^taskISNOTEMPTY^gap_status!=unmarked_as_gap^group_descriptionINjavascript: new sn_km_gen_ai.KnowledgeGap().filterUnaryClusters();";
        var KB_ASSIST_SCAN_RESULT_QUERY = "state=open";

        var items = [];
        var description = DESCRIPTION_FIELDS[table];
        var ga = new GlideAggregate(table);

        // Add applicable queries for tables
        if (table == "kb_duplicate_articles") {
            ga.addEncodedQuery(KB_DUPLICATE_ARTICLES_QUERY);
        } else if (table == "kb_gap_candidates") {
            var typeQuery = getGapTypeQuery();
            if (typeQuery) {
                KB_GAP_CANDIDATES_QUERY += typeQuery;
            }
            ga.addEncodedQuery(KB_GAP_CANDIDATES_QUERY);
        } else if (table == "kb_assist_scan_result") {
            ga.addEncodedQuery(KB_ASSIST_SCAN_RESULT_QUERY);
        }

        ga.groupBy(description);
        ga.addAggregate('MAX', 'sys_created_on');
		ga.addAggregate('MAX', 'task');
        ga.addAggregate('COUNT');
        ga.orderByAggregate('COUNT');
        ga.query();

        if (!ga.hasNext()) {
            return items; // Return early if no items
        }

		var currentCount = 0;
		var isGapTable = (table == "kb_gap_candidates");
		var nonHrGapItems = [];
		var hrGapItems = [];
        while (ga.next() && (isGapTable ? (nonHrGapItems.length < itemCount || hrGapItems.length < 2) : (currentCount < itemCount))) {
			var type = TYPES[table];
            var latestCreatedDate = ga.getAggregate('MAX', 'sys_created_on').split(" ", 1)[0];
            var descriptionValue;
            var gr;
			
            if (description == DESCRIPTION_FIELDS["kb_assist_scan_result"]) {
                var sys_id = ga.getValue(description);
                gr = new GlideRecord("kb_knowledge");
                gr.get(sys_id);
				descriptionValue = gr.short_description.getValue(); // Get article's description
            } else if (description == DESCRIPTION_FIELDS["kb_gap_candidates"]) {
                gr = new GlideRecord("task");
                var taskFound = gr.get(ga.getAggregate('MAX', 'task'));

				var gapTaskType = gr.getValue('sys_class_name');
				if (!gapTypes[gapTaskType] && taskFound) {
					var ancestors = new GlideTableHierarchy(gapTaskType).getTables();
					if (ancestors.indexOf('sn_customerservice_case') > -1) {
						gapTaskType = 'sn_customerservice_case';
					} else if (ancestors.indexOf('incident') > -1) {
						gapTaskType = 'incident';
					} else if (ancestors.indexOf('sn_hr_core_case') > -1) {
						gapTaskType = 'sn_hr_core_case';
					}
				}
				type = gapTypes[gapTaskType]; // Set gap type
                descriptionValue = ga.getValue(description); // Gap description
            } else {
                descriptionValue = ga.getValue(description); // Duplicate article cluster description
            }

			if(table == TABLES.isArticleOptimizationConfigured){
				if(!canEditArticle(gr)){
					continue;
				}
			}
            var actionItem = {
                type,
                description: descriptionValue,
                createdDate: latestCreatedDate,
                sysId: sys_id ? sys_id : null,
                taskType: gapTaskType ? gapTaskType : null
            };

            if (isGapTable) {
                if (gapTaskType == 'sn_hr_core_case') {
                    if (hrGapItems.length < 2) {
                        hrGapItems.push(actionItem);
                    }
                } else if (nonHrGapItems.length < itemCount) {
                    nonHrGapItems.push(actionItem);
                }
            } else {
                items.push(actionItem);
                currentCount++;
            }
        }

        if (isGapTable) {
            // ITSM/CSM gaps take priority; add HR (max 2) only if fewer than 2 ITSM/CSM gap items.
            items = nonHrGapItems.slice(0, itemCount);
            if (items.length < 2) {
                items = items.concat(hrGapItems.slice(0, Math.min(2, itemCount - items.length)));
            }
        }
        return items;
    }

    var configurations = {
        isDuplicatesConfigured: input.isDuplicatesConfigured,
        isGapsConfigured: input.isGapsITSMConfigured || input.isGapsCSMConfigured || input.isGapsHRConfigured,
        isArticleOptimizationConfigured: input.isArticleOptimizationConfigured
    };
    var itemCount = getItemCount(configurations);

    var items = [];
    for (var flag in TABLES) {
        if (TABLES.hasOwnProperty(flag)) {
            var tableName = TABLES[flag];
            if (configurations[flag]) {
                items = items.concat(getItems(tableName, itemCount));
            }
        }
    }

    items.sort(function(a, b) {
        var dateA = new GlideDateTime(a.createdDate);
        var dateB = new GlideDateTime(b.createdDate);
        return dateA < dateB ? 1 : -1;
    });

    return items;
}
