var CMDBWSImportantActionsUtil = Class.create();
	CMDBWSImportantActionsUtil.prototype = Object.extendsObject(CMDBWorkspaceUtil, {
		initialize: function() {
	},

	IMPORTANT_ACTION_CATEGORIES: {
		DATA_ATTESTATION: {
			ID: "data_attestation",
			NAME: gs.getMessage("Data Attestation"),
			TITLE_ICON: "clipboard-check-outline",
			BORDER_COLOR: "moderate"
		},
		DATA_MANAGEMENT : {
			ID: "data_management",
			NAME: gs.getMessage("Data Management"),
			TITLE_ICON: "form-outline",
			BORDER_COLOR: "info"
		},
		HEALTH : {
			ID: "health",
			NAME: gs.getMessage("Health"),
			TITLE_ICON: "health-status-outline",
			BORDER_COLOR: "orange"
		}
	},

	IMPORTANT_ACTION_METRIC_LABELS: {
		CI_COUNT: gs.getMessage("CI count"),
		TASK_COUNT: gs.getMessage("Task count")
	},

	IMPORTANT_ACTION_BUTTON_LABELS: {
		VIEW_CIS: gs.getMessage("View CIs"),
		VIEW_TASKS: gs.getMessage("View Tasks"),
		DE_DUPLICATION_DASHBOARD: gs.getMessage("De-duplication dashboard")
	},
	
	RECOMMENDATION_TYPES: {
		UPDATE_IRE_DEBUG_LOG_LEVEL: "update_ire_debug_log_level",
		REVIEW_BEFORE_QUERY_BR: "review_before_query_br",
		REMOVE_RELATED_RECORDS_MISSING_REF: "remove_related_records_missing_ref",
		REMOVE_REL_MISSING_PARENT_OR_CHILD: "remove_rel_missing_parent_or_child",
		MANAGE_STALE_CIS: "manage_stale_cis",
		REVIEW_SGC_DEFINITIONS: "review_sgc_definitions",
		ACTIVATE_CORRECTNESS_JOB: "activate_correctness_job"
	},

	getImportantActionTypes: function() {
		return {
			REASSIGNMENT_REQUESTS: {
				ID: "reassignment_requests",
				NAME: gs.getMessage("Reassignment requests"),
				TITLE: this.IMPORTANT_ACTION_CATEGORIES.DATA_ATTESTATION.NAME,
				TITLE_ICON: this.IMPORTANT_ACTION_CATEGORIES.DATA_ATTESTATION.TITLE_ICON,
				METADATA_LABEL: this.IMPORTANT_ACTION_METRIC_LABELS.TASK_COUNT,
				BUTTON_LABEL: this.IMPORTANT_ACTION_BUTTON_LABELS.VIEW_TASKS,
				BUTTON_TOOLTIP: gs.getMessage("View attestation tasks that need reassignment"),
				BORDER_COLOR: this.IMPORTANT_ACTION_CATEGORIES.DATA_ATTESTATION.BORDER_COLOR
			},
			UNASSIGNED_OVERDUE_TASKS: {
				ID: "unassigned_overdue_tasks",
				NAME: gs.getMessage("Unassigned overdue tasks"),
				TITLE: this.IMPORTANT_ACTION_CATEGORIES.DATA_ATTESTATION.NAME,
				TITLE_ICON: this.IMPORTANT_ACTION_CATEGORIES.DATA_ATTESTATION.TITLE_ICON,
				METADATA_LABEL: this.IMPORTANT_ACTION_METRIC_LABELS.TASK_COUNT,
				BUTTON_LABEL: this.IMPORTANT_ACTION_BUTTON_LABELS.VIEW_TASKS,
				BUTTON_TOOLTIP: gs.getMessage("View attestation tasks that are unassigned and overdue"),
				BORDER_COLOR: this.IMPORTANT_ACTION_CATEGORIES.DATA_ATTESTATION.BORDER_COLOR
			},
			LIFECYCLE_APPROVALS: {
				ID: "lifecycle_approvals",
				NAME: gs.getMessage("Lifecycle approvals"),
				TITLE: this.IMPORTANT_ACTION_CATEGORIES.DATA_MANAGEMENT.NAME,
				TITLE_ICON: this.IMPORTANT_ACTION_CATEGORIES.DATA_MANAGEMENT.TITLE_ICON,
				METADATA_LABEL: this.IMPORTANT_ACTION_METRIC_LABELS.TASK_COUNT,
				BUTTON_LABEL: this.IMPORTANT_ACTION_BUTTON_LABELS.VIEW_TASKS,
				BUTTON_TOOLTIP: gs.getMessage("View lifecycle approval tasks"),
				BORDER_COLOR: this.IMPORTANT_ACTION_CATEGORIES.DATA_MANAGEMENT.BORDER_COLOR
			},
			DE_DUPLICATION_TASKS: {
				ID: "de_duplication_tasks",
				NAME: gs.getMessage("De-duplication tasks"),
				TITLE: this.IMPORTANT_ACTION_CATEGORIES.HEALTH.NAME,
				TITLE_ICON: this.IMPORTANT_ACTION_CATEGORIES.HEALTH.TITLE_ICON,
				METADATA_LABEL: this.IMPORTANT_ACTION_METRIC_LABELS.TASK_COUNT,
				BUTTON_LABEL: this.IMPORTANT_ACTION_BUTTON_LABELS.DE_DUPLICATION_DASHBOARD,
				BUTTON_TOOLTIP: gs.getMessage("Access the De-duplication dashboard"),
				BORDER_COLOR: this.IMPORTANT_ACTION_CATEGORIES.HEALTH.BORDER_COLOR
			},
			DUPLICATE_CIS: {
				ID: "duplicate_cis",
				NAME: gs.getMessage("Duplicate CIs"),
				TITLE: this.IMPORTANT_ACTION_CATEGORIES.HEALTH.NAME,
				TITLE_ICON: this.IMPORTANT_ACTION_CATEGORIES.HEALTH.TITLE_ICON,
				METADATA_LABEL: this.IMPORTANT_ACTION_METRIC_LABELS.CI_COUNT,
				BUTTON_LABEL: this.IMPORTANT_ACTION_BUTTON_LABELS.VIEW_CIS,
				BUTTON_TOOLTIP: gs.getMessage("View duplicate CIs"),
				BORDER_COLOR: this.IMPORTANT_ACTION_CATEGORIES.HEALTH.BORDER_COLOR
			},
			ORPHAN_CIS: {
				ID: "orphan_cis",
				NAME: gs.getMessage("Orphan CIs"),
				TITLE: this.IMPORTANT_ACTION_CATEGORIES.HEALTH.NAME,
				TITLE_ICON: this.IMPORTANT_ACTION_CATEGORIES.HEALTH.TITLE_ICON,
				METADATA_LABEL: this.IMPORTANT_ACTION_METRIC_LABELS.CI_COUNT,
				BUTTON_LABEL: this.IMPORTANT_ACTION_BUTTON_LABELS.VIEW_CIS,
				BUTTON_TOOLTIP: gs.getMessage("View orphan CIs"),
				BORDER_COLOR: this.IMPORTANT_ACTION_CATEGORIES.HEALTH.BORDER_COLOR
			},         
			STALE_CIS: {
				ID: "stale_cis",
				NAME: gs.getMessage("Stale CIs"),
				TITLE: this.IMPORTANT_ACTION_CATEGORIES.HEALTH.NAME,
				TITLE_ICON: this.IMPORTANT_ACTION_CATEGORIES.HEALTH.TITLE_ICON,
				METADATA_LABEL: this.IMPORTANT_ACTION_METRIC_LABELS.CI_COUNT,
				BUTTON_LABEL: this.IMPORTANT_ACTION_BUTTON_LABELS.VIEW_CIS,
				BUTTON_TOOLTIP: gs.getMessage("View stale CIs"),
				BORDER_COLOR: this.IMPORTANT_ACTION_CATEGORIES.HEALTH.BORDER_COLOR
			},
			EXCLUDED_CIS: {
				ID: "excluded_cis",
				NAME: gs.getMessage("Excluded CIs"),
				TITLE: this.IMPORTANT_ACTION_CATEGORIES.DATA_MANAGEMENT.NAME,
				TITLE_ICON: this.IMPORTANT_ACTION_CATEGORIES.DATA_MANAGEMENT.TITLE_ICON,
				METADATA_LABEL: this.IMPORTANT_ACTION_METRIC_LABELS.CI_COUNT,
				BUTTON_LABEL: this.IMPORTANT_ACTION_BUTTON_LABELS.VIEW_CIS,
				BUTTON_TOOLTIP: gs.getMessage("View excluded CIs"),
				BORDER_COLOR: this.IMPORTANT_ACTION_CATEGORIES.DATA_MANAGEMENT.BORDER_COLOR
			},
			CMDB_EDITOR_OVERDUE_TASKS: {
				ID: "cmdb_editor_overdue_tasks",
				NAME: gs.getMessage("Overdue tasks"),
				TITLE: this.IMPORTANT_ACTION_CATEGORIES.DATA_ATTESTATION.NAME,
				TITLE_ICON: this.IMPORTANT_ACTION_CATEGORIES.DATA_ATTESTATION.TITLE_ICON,
				METADATA_LABEL: this.IMPORTANT_ACTION_METRIC_LABELS.TASK_COUNT,
				BUTTON_LABEL: this.IMPORTANT_ACTION_BUTTON_LABELS.VIEW_TASKS,
				BUTTON_TOOLTIP: gs.getMessage("View overdue tasks"),
				BORDER_COLOR: this.IMPORTANT_ACTION_CATEGORIES.DATA_ATTESTATION.BORDER_COLOR
			},
			CMDB_EDITOR_OPEN_TASKS: {
				ID: "cmdb_editor_open_tasks",
				NAME: sn_i18n.Message.getMessage("sn_cmdb_ws.openTasks.adjective", "Open tasks"),
				TITLE: this.IMPORTANT_ACTION_CATEGORIES.DATA_ATTESTATION.NAME,
				TITLE_ICON: this.IMPORTANT_ACTION_CATEGORIES.DATA_ATTESTATION.TITLE_ICON,
				METADATA_LABEL: this.IMPORTANT_ACTION_METRIC_LABELS.TASK_COUNT,
				BUTTON_LABEL: this.IMPORTANT_ACTION_BUTTON_LABELS.VIEW_TASKS,
				BUTTON_TOOLTIP: gs.getMessage("View open tasks"),
				BORDER_COLOR: this.IMPORTANT_ACTION_CATEGORIES.DATA_ATTESTATION.BORDER_COLOR
			},
			CMDB_EDITOR_LIFECYCLE_APPROVALS: {
				ID: "cmdb_editor_lifecycle_approvals",
				NAME: gs.getMessage("Lifecycle approvals"),
				TITLE: this.IMPORTANT_ACTION_CATEGORIES.DATA_MANAGEMENT.NAME,
				TITLE_ICON: this.IMPORTANT_ACTION_CATEGORIES.DATA_MANAGEMENT.TITLE_ICON,
				METADATA_LABEL: this.IMPORTANT_ACTION_METRIC_LABELS.TASK_COUNT,
				BUTTON_LABEL: this.IMPORTANT_ACTION_BUTTON_LABELS.VIEW_TASKS,
				BUTTON_TOOLTIP: gs.getMessage("View lifecycle approval tasks"),
				BORDER_COLOR: this.IMPORTANT_ACTION_CATEGORIES.DATA_MANAGEMENT.BORDER_COLOR
			},
			CMDB_EDITOR_DUPLICATE_CIS: {
				ID: "cmdb_editor_duplicate_cis",
				NAME: gs.getMessage("Duplicate CIs"),
				TITLE: this.IMPORTANT_ACTION_CATEGORIES.HEALTH.NAME,
				TITLE_ICON: this.IMPORTANT_ACTION_CATEGORIES.HEALTH.TITLE_ICON,
				METADATA_LABEL: this.IMPORTANT_ACTION_METRIC_LABELS.CI_COUNT,
				BUTTON_LABEL: this.IMPORTANT_ACTION_BUTTON_LABELS.VIEW_CIS,
				BUTTON_TOOLTIP: gs.getMessage("View duplicate CIs"),
				BORDER_COLOR: this.IMPORTANT_ACTION_CATEGORIES.HEALTH.BORDER_COLOR
			},
			CMDB_EDITOR_ORPHAN_CIS: {
				ID: "cmdb_editor_orphan_cis",
				NAME: gs.getMessage("Orphan CIs"),
				TITLE: this.IMPORTANT_ACTION_CATEGORIES.HEALTH.NAME,
				TITLE_ICON: this.IMPORTANT_ACTION_CATEGORIES.HEALTH.TITLE_ICON,
				METADATA_LABEL: this.IMPORTANT_ACTION_METRIC_LABELS.CI_COUNT,
				BUTTON_LABEL: this.IMPORTANT_ACTION_BUTTON_LABELS.VIEW_CIS,
				BUTTON_TOOLTIP: gs.getMessage("View orphan CIs"),
				BORDER_COLOR: this.IMPORTANT_ACTION_CATEGORIES.HEALTH.BORDER_COLOR
			},         
			CMDB_EDITOR_STALE_CIS: {
				ID: "cmdb_editor_stale_cis",
				NAME: gs.getMessage("Stale CIs"),
				TITLE: this.IMPORTANT_ACTION_CATEGORIES.HEALTH.NAME,
				TITLE_ICON: this.IMPORTANT_ACTION_CATEGORIES.HEALTH.TITLE_ICON,
				METADATA_LABEL: this.IMPORTANT_ACTION_METRIC_LABELS.CI_COUNT,
				BUTTON_LABEL: this.IMPORTANT_ACTION_BUTTON_LABELS.VIEW_CIS,
				BUTTON_TOOLTIP: gs.getMessage("View stale CIs"),
				BORDER_COLOR: this.IMPORTANT_ACTION_CATEGORIES.HEALTH.BORDER_COLOR
			}
		};
	},

	getImportantActionCardDescription: function(type, count) {
		count = sn_i18n.NumberFormatter.format(Number(count));
		var map = {
			REASSIGNMENT_REQUESTS: gs.getMessage("{0} unassigned data attestation tasks must be assigned. Review the tasks for assignment.", count),
			UNASSIGNED_OVERDUE_TASKS: gs.getMessage("{0} overdue data attestation tasks are unassigned. Review for activity.", count),
			LIFECYCLE_APPROVALS: gs.getMessage("{0} CI lifecycle approval tasks assigned by CMDB Data Manager. Review the tasks.", count),
			DE_DUPLICATION_TASKS: gs.getMessage("{0} de-duplication tasks have been created. Review the tasks to remediate duplicate CIs.", count),
			DUPLICATE_CIS: gs.getMessage("{0} CIs are identified as duplicates. Review the CIs to improve CMDB health.", count),
			ORPHAN_CIS: gs.getMessage("{0} CIs are missing relationships. Review the CIs to improve CMDB health.", count),
			STALE_CIS: gs.getMessage("{0} CIs have not been updated recently. Review the CIs to improve CMDB health.", count),
			EXCLUDED_CIS: gs.getMessage("{0} CIs are excluded from CMDB Data Manager policies. Review the CIs for possible reinstatement.", count),
			CMDB_EDITOR_OVERDUE_TASKS: gs.getMessage("{0} data attestation tasks are overdue. Review the tasks.", count),
			CMDB_EDITOR_OPEN_TASKS: gs.getMessage("{0} data attestation tasks are new. Review the tasks.", count),
			CMDB_EDITOR_LIFECYCLE_APPROVALS: gs.getMessage("{0} CI lifecycle approval tasks have been assigned by CMDB Data Manager. Review the tasks.", count),
			CMDB_EDITOR_DUPLICATE_CIS: gs.getMessage("{0} of the CIs that you manage are identified as duplicates. Review the CIs to improve CMDB health.", count),
			CMDB_EDITOR_ORPHAN_CIS: gs.getMessage("{0} of the CIs that you manage are missing relationships. Review the CIs to improve CMDB health.", count),
			CMDB_EDITOR_STALE_CIS: gs.getMessage("{0} of the CIs that you manage were not updated recently. Review the CIs to improve CMDB health.", count)
		};
		return map[type];
	},

	_getRecommendationDescription: function(type, count) {
		count = sn_i18n.NumberFormatter.format(Number(count));
		switch(type) {
			case 'UPDATE_IRE_DEBUG_LOG_LEVEL':
				return gs.getMessage("IRE logging level is set to info, debug, or debugVerbose, which might cause CMDB to perform slower than expected. Consider setting the glide.cmdb.logger.source.identification_engine property, that determines IRE logging level, to be less performance-intensive, such as error. Click {0}here{1} to learn more about the different settings for IRE logging.", ["<a href='/api/now/v1/context_doc_url/CMDB_IRE_Properties' target='_blank' rel='oopener noreferrer nofollow' style='color:rgb(var(--now-color--link-2))'>", "</a>"]);
			case 'REVIEW_BEFORE_QUERY_BR':
				return gs.getMessage("There are {0} Before Query business rules on CI tables, which might cause CMDB to perform slower than expected. Consider reviewing these Before Query business rules to remove any that aren't necessary.", count);
			case 'REMOVE_RELATED_RECORDS_MISSING_REF':
				return gs.getMessage("Use CMDB Data Manager to delete CMDB related entry records in which reference to CIs is missing. Click {0}here{1} to learn more about using CMDB Data Manager.", ["<a href='/api/now/v1/context_doc_url/Data_Manager_Entry' target='_blank' rel='oopener noreferrer nofollow' style='color:rgb(var(--now-color--link-2))'>","</a>"]);
			case 'REMOVE_REL_MISSING_PARENT_OR_CHILD':
				return gs.getMessage("Run a cleanup script to remove any relationship records in which a child or a parent is missing.");
			case 'MANAGE_STALE_CIS':
				return gs.getMessage("Use CMDB Data Manager to retire, archive, or delete stale CIs. Click {0}here{1} to learn more about using CMDB Data Manager.", ["<a href='/api/now/v1/context_doc_url/Data_Manager_Entry' target='_blank' rel='oopener noreferrer nofollow' style='color:rgb(var(--now-color--link-2))'>", "</a>"]);
			case 'REVIEW_SGC_DEFINITIONS':
				return gs.getMessage("Review these Service Graph connector definitions to fix partial payloads with errors.");
			case 'ACTIVATE_CORRECTNESS_JOB':
				return gs.getMessage("Gather insights into stale and duplicate CIs in your CMDB by enabling the CMDB Health Dashboard - Correctness Score Calculation job. Click {0}here{1} to learn more about CMDB Health Dashboard jobs.", ["<a href='/api/now/v1/context_doc_url/Config_CMDB_Health_Dashboard_Jobs' target='_blank' rel='oopener noreferrer nofollow' style='color:rgb(var(--now-color--link-2))'>", "</a>"]);
			default:
				return '';
		}
	},

	getRecommendationTypes: function() {
		return {
			UPDATE_IRE_DEBUG_LOG_LEVEL: {
				ID: this.RECOMMENDATION_TYPES.UPDATE_IRE_DEBUG_LOG_LEVEL,
				NAME: gs.getMessage("Turn off IRE debug log"),
				ACTION_LINK: {
					TEXT: gs.getMessage("Adjust debug log value"),
					TYPE: this.LINK_TYPES.ROUTE,
					HREF: this.HREF_FOR_ROUTE_TYPE,
					OPEN_NEW_WINDOW: false,
					ROUTE: {
						route: this.LIST_ROUTE,
						fields: {
							table: this.TABLES.SYS_PROPERTIES
						},
						params: {
							listTitle: gs.getMessage('System properties'),
							query: 'name=glide.cmdb.logger.source.identification_engine^EQ'
						}
					}
				}
			},
			REVIEW_BEFORE_QUERY_BR: {
				ID: this.RECOMMENDATION_TYPES.REVIEW_BEFORE_QUERY_BR,
				NAME: gs.getMessage("Review “before query” business rules"),
				ACTION_LINK: {
					TEXT: gs.getMessage("Review business rules"),
					HREF: "nav_to.do?uri=%2Fsys_script_list.do%3Fsysparm_query%3DcollectionINSTANCEOFcmdb_ci^active=true^when=before^action_query=true^EQ",
					TYPE: this.LINK_TYPES.EXTERNAL,
					OPEN_NEW_WINDOW: true
				}
			},
			REMOVE_RELATED_RECORDS_MISSING_REF: {
				ID: this.RECOMMENDATION_TYPES.REMOVE_RELATED_RECORDS_MISSING_REF,
				NAME: gs.getMessage("Remove CMDB related entry records missing references"),
				ACTION_LINK: {
					TEXT: gs.getMessage("Create Data Manager policy"),
					HREF: this.HREF_FOR_ROUTE_TYPE,
					TYPE: this.LINK_TYPES.ROUTE,
					OPEN_NEW_WINDOW: false,
					ROUTE: {
						route: "data-manager-policy-form",
						fields: {
							"policySysId": "-1",
							"ts": Date.now()
						}
					}
				}
			},
			REMOVE_REL_MISSING_PARENT_OR_CHILD: {
				ID: this.RECOMMENDATION_TYPES.REMOVE_REL_MISSING_PARENT_OR_CHILD,
				NAME: gs.getMessage("Remove relationship records missing parent or child"),
				ACTION_LINK: {
					TEXT: gs.getMessage("Learn more"),
					HREF: "https://support.servicenow.com/kb?id=kb_article_view&sysparm_article=KB0829101",
					TYPE: this.LINK_TYPES.EXTERNAL,
					OPEN_NEW_WINDOW: true
				}
			},
			MANAGE_STALE_CIS: {
				ID: this.RECOMMENDATION_TYPES.MANAGE_STALE_CIS,
				NAME: gs.getMessage("Manage stale CIs"),
				ACTION_LINK: {
					TEXT: gs.getMessage("Create Data Manager policy"),
					HREF: this.HREF_FOR_ROUTE_TYPE,
					TYPE: this.LINK_TYPES.ROUTE,
					OPEN_NEW_WINDOW: false,
					ROUTE: {
						route: "data-manager-policy-form",
						fields: {
							"policySysId": "-1",
							"ts": Date.now()
						}
					}
				}
			},
			REVIEW_SGC_DEFINITIONS: {
				ID: this.RECOMMENDATION_TYPES.REVIEW_SGC_DEFINITIONS,
				NAME: gs.getMessage("Review SGC definitions"),
				ACTION_LINK: {
					TEXT: gs.getMessage("Go to IntegrationHub ETL"),
					HREF: "nav_to.do?uri=%2F$cmdb_integration_studio.do",
					TYPE: this.LINK_TYPES.EXTERNAL,
					OPEN_NEW_WINDOW: true
				}
			},
			ACTIVATE_CORRECTNESS_JOB: {
				ID: this.RECOMMENDATION_TYPES.ACTIVATE_CORRECTNESS_JOB,
				NAME: gs.getMessage("Activate CMDB Health Dashboard Correctness job"),
				ACTION_LINK: {
					TEXT: gs.getMessage("Review CMDB Health Dashboard jobs"),
					HREF: "nav_to.do?uri=%2F$cmdb_health_properties.do",
					TYPE: this.LINK_TYPES.EXTERNAL,
					OPEN_NEW_WINDOW: true
				}
			},
		};
	},
		
	getImportantActionConfigs: function() {
		var result = {};
		var configs = [];
		var importantActionCards = new GlideRecord(this.TABLES.SN_CMDB_WS_IMP_ACTION_CARD_CONFIG);
		importantActionCards.addQuery(this.COLS.CATEGORY, this.ACTION_CONFIG_CATEGORY.IMPORTANT_ACTION);
		if(gs.getUser().hasRole(this.ROLES.SN_CMDB_ADMIN)) {
			importantActionCards.addQuery(this.COLS.PERSONA, this.PERSONAS.CMDB_ADMIN);
		} else {
			importantActionCards.addQuery(this.COLS.PERSONA, this.PERSONAS.CMDB_EDITOR);
		}
		importantActionCards.addActiveQuery();
		importantActionCards.orderBy(this.COLS.ORDER);
		importantActionCards.query();

		while (importantActionCards.next()) {
			var sysId = importantActionCards.getValue(this.COLS.SYS_ID);
			var tableName = importantActionCards.getValue(this.COLS.TABLE);
			var filterConditions = importantActionCards.getValue(this.COLS.FILTER_CONDITIONS);
			var type = importantActionCards.getValue(this.COLS.TYPE);
			var list_columns = importantActionCards.getValue(this.COLS.LIST_COLUMNS);
			var list_groupby = importantActionCards.getValue(this.COLS.LIST_GROUPBY);
			var runType = importantActionCards.getValue(this.COLS.RUN_TYPE);
			runType = global.JSUtil.nil(runType) ? this.RUN_TYPE.ON_DEMAND : Number(runType);
			configs.push({
				sysId: sysId,
				tableName: tableName,
				filterConditions: filterConditions,
				type: type,
				runType: runType,
				list_columns: list_columns,
				list_groupby: list_groupby
			});
		}
		result.configs = configs;
		result.lastRefreshedDateTime = gs.getMessage("Last updated: {0}", new GlideDateTime().getDisplayValue());
		result.impActionTypes = this.getImportantActionTypes();
		return result;
	},
		
	getImportantActionCardData: function(manualRefresh) {
		var impConfigs = this.getImportantActionConfigs();
		var configs = impConfigs.configs;
		var response = {};
		response.configs = impConfigs.configs;
		response.lastRefreshedDateTime = impConfigs.lastRefreshedDateTime;
		response.impActionTypes = impConfigs.impActionTypes;
		var result = [];
		for (var i = 0; i < configs.length; i++) {
			var config = configs[i];
			var runType = config.runType;
			var configId = config.sysId;
			if (!manualRefresh && global.JSUtil.notNil(runType) && runType > this.RUN_TYPE.ON_DEMAND) {
				var gr = new GlideRecord(this.TABLES.SN_CMDB_WS_BASE_AGGREGATE_DATA);
				gr.addQuery(this.COLS.CHART, this.SUB_CATEGORY.IMPORTANT_ACTION);
				gr.addQuery(this.COLS.STATE, this.STATES.READY);
				gr.addQuery(this.COLS.DYNAMIC_GROUP_BY, config.sysId);
				gr.query();
				if (gr.next()) {
					var count = gr.getValue(this.COLS.COUNT);
					var createdOn = new GlideDateTime(gr.getValue(this.COLS.SYS_CREATED_ON)).getNumericValue();
					var lastUpdatedHour = Math.floor((new GlideDateTime().getNumericValue() - createdOn) / 1000 / 60 / 60);
					if (global.JSUtil.notNil(count) && Number(count) > 0) {
						result.push({
							type: config.type,
							configId: configId,
							count: Number(count),
							description: this.getImportantActionCardDescription(config.type.toUpperCase(), count),
							table_name: config.tableName,
							filter_conditions: config.filterConditions,
							list_columns: config.list_columns,
							list_groupby: config.list_groupby,
							has_list_actions: this.tableHasActionConfig(config.tableName),
							isAsync: true,
							isSessionCache: false,
							lastUpdatedHour: lastUpdatedHour
						});
					}
				}
				continue;
			}

			var session = gs.getSession();
			var ignoreCache = this.parseBooleanString(gs.getProperty(this.SYS_PROPERTIES_NAME.IMPORTANT_ACTION_IGNORE_SESSION_CACHE, 'false'));
			if (!manualRefresh && !ignoreCache) {
				var cacheCountObj = session.getClientData(configId);
				try {
					cacheCountObj = JSON.parse(cacheCountObj);
				} catch(e) {
					cacheCountObj = '';
				}
				if (global.JSUtil.notNil(cacheCountObj)) {
					cacheCount = Number(cacheCountObj.count);
					var lastUpdatedHour = Math.floor((new GlideDateTime().getNumericValue() - cacheCountObj.createdOn) / 1000 / 60 / 60);
					if (cacheCount > 0) {
						result.push({
							type: config.type,
							configId: configId,
							count: cacheCount,
							description: this.getImportantActionCardDescription(config.type.toUpperCase(), cacheCount),
							table_name: config.tableName,
							filter_conditions: config.filterConditions,
							list_columns: config.list_columns,
							list_groupby: config.list_groupby,
							has_list_actions: this.tableHasActionConfig(config.tableName),
							isSessionCache: true,
							isAsync: false,
							lastUpdatedHour: lastUpdatedHour
						});
					}
					continue;
				}
			}
			var ga = new GlideAggregate(config.tableName);
			if (config.filterConditions) {
				ga.addEncodedQuery(config.filterConditions, true);
			}
			ga.addAggregate('COUNT');
			ga.query();
			if (ga.next()) {
				var count = Number(ga.getAggregate('COUNT'));
				var cacheObj = {count: count, createdOn: new GlideDateTime().getNumericValue()};
				session.putClientData(configId, JSON.stringify(cacheObj));
				if (global.JSUtil.notNil(runType) && runType > this.RUN_TYPE.ON_DEMAND) {
					this._refreshImpActionDailyAgg(configId, count);
				}
				if (count > 0) {
					result.push({
						type: config.type,
						configId: configId,
						count: count,
						description: this.getImportantActionCardDescription(config.type.toUpperCase(), count),
						table_name: config.tableName,
						filter_conditions: config.filterConditions,
						list_columns: config.list_columns,
						list_groupby: config.list_groupby,
						has_list_actions: this.tableHasActionConfig(config.tableName),
						lastUpdatedHour: -1,
						isSessionCache: false,
						isAsync: false
					});
				}
			}
		}
		response.cards = result;
		return response;
	},

	_refreshImpActionDailyAgg: function(configId, newCount) {
		this.updateBaseAggDataState(this.STATES.DRAFT, this.STATES.RETIRED, this.SUB_CATEGORY.IMPORTANT_ACTION, null, configId);
		this.populateBaseAggData(this.SUB_CATEGORY.IMPORTANT_ACTION, '', newCount, this.STATES.DRAFT, '', configId);
		this.updateBaseAggDataState(this.STATES.READY, this.STATES.RETIRED, this.SUB_CATEGORY.IMPORTANT_ACTION, null, configId);
		this.updateBaseAggDataState(this.STATES.DRAFT, this.STATES.READY, this.SUB_CATEGORY.IMPORTANT_ACTION, null, configId);
	},

	calculateImportantActionCount: function(config) {
		var ga = new GlideAggregate(config.tableName);
		if (config.filterConditions) {
			ga.addEncodedQuery(config.filterConditions, true);
		}
		ga.addAggregate('COUNT'); 
		ga.query();

		if (ga.next()) {
			var count = ga.getAggregate('COUNT');

			if (count > 0) {
				return {
					type: config.type,
					count: count,
					table_name: config.tableName,
					filter_conditions: config.filterConditions,
					list_columns: config.list_columns,
					list_groupby: config.list_groupby,
					has_list_actions: this.tableHasActionConfig(config.tableName)
				};
			}
		}
		return '';
	},
	
	verifyCardContainsCount: function(type) {
		if (type == this.RECOMMENDATION_TYPES.REVIEW_BEFORE_QUERY_BR) {
			return true;
		}
		return false;
	},
																
	getRecommendationConfigs: function() {
		var result = {};
		var configs = [];
		var recommendationCards = new GlideRecord(this.TABLES.SN_CMDB_WS_IMP_ACTION_CARD_CONFIG);
		recommendationCards.addQuery(this.COLS.CATEGORY, this.ACTION_CONFIG_CATEGORY.RECOMMENDATION);
		if(gs.getUser().hasRole(this.ROLES.SN_CMDB_ADMIN)) {
			recommendationCards.addQuery(this.COLS.PERSONA, this.PERSONAS.CMDB_ADMIN);
		}
		recommendationCards.addActiveQuery();
		recommendationCards.orderBy(this.COLS.ORDER);
		recommendationCards.query();

		while (recommendationCards.next()) {
			var tableName = recommendationCards.getValue(this.COLS.TABLE);
			var filterConditions = recommendationCards.getValue(this.COLS.FILTER_CONDITIONS);
			var type = recommendationCards.getValue(this.COLS.TYPE);
			
			configs.push({
				tableName: tableName,
				filterConditions: filterConditions,
				type: type,
				displayCount : this.verifyCardContainsCount(type)
			});
		}
		result.configs = configs;
		result.recommendationTypes = this.getRecommendationTypes();
		return result;
	},
		
	getRecommendationCardData: function(maxCardCount) {
		var configObj = this.getRecommendationConfigs();
		var configs = configObj.configs;
		var recommendationTypes = configObj.recommendationTypes;
		var result = {};
		result.configs = configs;
		result.recommendationTypes = recommendationTypes;
		result.cards = [];

		for (var i = 0; i < configs.length; i++) {
			if (global.JSUtil.notNil(maxCardCount) && result.cards.length >= maxCardCount) {
				break;
			}
			var config = configs[i];
			var displayCard = false;
			var resultObj = {};
			var count = 0;
			
			if (config.type == this.RECOMMENDATION_TYPES.REVIEW_SGC_DEFINITIONS) {
				var discoverySource = "";
				var integrationDiscoverySources = [];
				var grs = new GlideRecordSecure(this.TABLES.CMDB_INST_APPLICATION);
				grs.addEncodedQuery(this.COLS.NAME + this.OPERATORS.NOTLIKE + this.IH_ETL_DEMODATA_PREFIX);
				grs.query();
				while (grs.next()) {
					discoverySource = grs.getDisplayValue(this.COLS.DISCOVERY_SOURCE);
					if (integrationDiscoverySources.indexOf(discoverySource) == -1) {
						integrationDiscoverySources.push(grs.getDisplayValue(this.COLS.DISCOVERY_SOURCE));
					}
				}
				if (integrationDiscoverySources.length > 0) {
					grs = new GlideRecordSecure(config.tableName);
					if (config.filterConditions) {
						grs.addEncodedQuery(config.filterConditions, true);
					}
					grs.query();
					while (grs.next()) {
						discoverySource = grs.getValue(this.COLS.DYNAMIC_GROUP_BY);
						if (integrationDiscoverySources.indexOf(discoverySource) > -1) {
							displayCard = true;
							break;
						}
					}
				}
			} else if (config.displayCount) {
				var ga = new GlideAggregate(config.tableName);
				if (ga.canRead()) {
					if (config.filterConditions) {
						ga.addEncodedQuery(config.filterConditions, true);
					}
					ga.addAggregate('COUNT'); 
					ga.query();
					if (ga.next()) {
						count = Number(ga.getAggregate('count'));
					}
					if (count > 0) {
						displayCard = true;
					}
				}
			} else {
				var grs = new GlideRecordSecure(config.tableName);
				if (grs.canRead()) {
					if (config.filterConditions) {
						grs.addEncodedQuery(config.filterConditions, true);
					}
					grs.setLimit(1);
					grs.query();
					if (grs.next()) {
						if (config.type == this.RECOMMENDATION_TYPES.UPDATE_IRE_DEBUG_LOG_LEVEL) {
							var propertyValue = grs.getValue(this.COLS.VALUE);
							if (global.JSUtil.nil(propertyValue)) {
								propertyValue = '';
							}
							if ((grs.canWrite() || this.isUserAdminOrMaint()) && (propertyValue.includes(this.IRE_DEBUG_LOG_LEVEL.INFO) || propertyValue.includes(this.IRE_DEBUG_LOG_LEVEL.DEBUG))) {
								displayCard = true;
							}
						} else {
							displayCard = true;
						}
					}
				}
			}
			if (global.JSUtil.nil(maxCardCount) || displayCard) {
				result.cards.push({
					type: config.type,
					display: displayCard,
					count: count,
					description: this._getRecommendationDescription(config.type.toUpperCase(), count)
				});
			}
		}
		return result;
	},

    type: 'CMDBWSImportantActionsUtil'
});
