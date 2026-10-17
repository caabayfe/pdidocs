function transform(input) {
    var wrapperFn = function() {
        var WS = new CMDBWsConstants();
        var DM = new CMDBWsDMConstants();

        var isAdmin = gs.hasRole(WS.ROLES.SN_CMDB_ADMIN) || gs.hasRole(WS.ROLES.MAINT);

        var IS_OVERDUE = DM.TASK_FILTERS.IS_OVERDUE;
        var IS_WORK_IN_PROGRESS = DM.TASK_FILTERS.IS_WORK_IN_PROGRESS;
        var IS_OPEN = DM.TASK_FILTERS.IS_OPEN;
        var IS_NOT_CLOSED = DM.TASK_FILTERS.IS_NOT_CLOSED;
        var ASSIGNED_TO_IS_EMPTY = DM.TASK_FILTERS.ASSIGNED_TO_IS_EMPTY;
        var ASSIGNMENT_GROUP_IS_EMPTY = DM.TASK_FILTERS.ASSIGNMENT_GROUP_IS_EMPTY;
        var IS_ATTESTATION_TASK = DM.TASK_FILTERS.IS_ATTESTATION_TASK;
        var IS_APPROVAL_TASK = DM.TASK_FILTERS.IS_APPROVAL_TASK;
        var IS_CERTIFICATION_TASK = DM.TASK_FILTERS.IS_CERTIFICATION_TASK;
		var IS_CLOSED = DM.TASK_FILTERS.IS_CLOSED;

        var TABS = {
            ATTESTATION_TASKS: {
                KEY: 'attestation_tasks',
                TAB_LABEL: sn_i18n.Message.getMessage("sn_cmdb_ws", 'Attestation tasks'),
                LIST_TITLE: sn_i18n.Message.getMessage("sn_cmdb_ws", 'Attestation tasks'),
                VIEW: "852ce648a399021065729bd2361e61a0"
            },
            CERTIFICATION_TASKS: {
                KEY: 'certification_tasks',
                TAB_LABEL: sn_i18n.Message.getMessage("sn_cmdb_ws", 'Certification tasks'),
                LIST_TITLE: sn_i18n.Message.getMessage("sn_cmdb_ws", 'Certification tasks'),
                VIEW: "f68a2aaaa315021065729bd2361e61c3"
            },
            APPROVAL_TASKS: {
                KEY: 'approval_tasks',
                TAB_LABEL: sn_i18n.Message.getMessage("sn_cmdb_ws", 'All other tasks'),
                LIST_TITLE: sn_i18n.Message.getMessage("sn_cmdb_ws", 'Approval tasks'),
                VIEW: "7e7ea20ca399021065729bd2361e6187"
            }
        };

        var ACTION_CONFIG = {
            DEFAULT: '0679fc44eb8d31100c0bb5d5d85228da',
            CANCELLABLE_TASK: '9bc4bc00eb8d31100c0bb5d5d8522890'
        };

        var CARDS = {
            TOTAL: {
                KEY: 'total',
                LABEL: sn_i18n.Message.getMessage("sn_cmdb_ws", "Total tasks"),
                ARIA_CONFIG: {
                    "aria-label": sn_i18n.Message.getMessage("sn_cmdb_ws", "Apply total tasks filter to lists")
                }
            },
            IN_PROGRESS: {
                KEY: "in_progress",
                LABEL: sn_i18n.Message.getMessage("sn_cmdb_ws", "In progress"),
                ARIA_CONFIG: {
                    "aria-label": sn_i18n.Message.getMessage("sn_cmdb_ws", "Apply in progress tasks filter to lists")
                }
            },
            OVERDUE: {
                KEY: 'overdue',
                LABEL: sn_i18n.Message.getMessage("sn_cmdb_ws", "Overdue"),
                ARIA_CONFIG: {
                    "aria-label": sn_i18n.Message.getMessage("sn_cmdb_ws", "Apply overdue tasks filter to lists")
                }
            },
            NOT_STARTED: {
                KEY: "not_started",
                LABEL: sn_i18n.Message.getMessage("sn_cmdb_ws", "Not started"),
                ARIA_CONFIG: {
                    "aria-label": sn_i18n.Message.getMessage("sn_cmdb_ws", "Apply not started tasks filter to lists")
                }
            },
            UNASSIGNED: {
                KEY: "unassigned",
                LABEL: sn_i18n.Message.getMessage("sn_cmdb_ws", "Unassigned"),
                ARIA_CONFIG: {
                    "aria-label": sn_i18n.Message.getMessage("sn_cmdb_ws", "Apply unassigned tasks filter to lists")
                }
            },
			CLOSED: {
				KEY: "closed",
				LABEL: sn_i18n.Message.getMessage("sn_cmdb_ws", "Closed"),
				ARIA_CONFIG: {
					"aria-label": sn_i18n.Message.getMessage("sn_cmdb_ws", "Apply closed tasks filter to lists")
				}
			}
        };

        // var featureUtil = new CMDBWsFeatureSupportUtil();
        // var isNewDMSupported = featureUtil.supportsFeature(featureUtil.FEATURE_IDS.DATA_MANAGER.ID);

        var proxy = new sn_cmdb_ws.CMDBWsDMTaskUIProxy();
        var assignmentFilter = '';
        assignmentFilter = proxy.getTaskAssignmentFilterQuery();

        // if (!isNewDMSupported) {
        //     assignmentFilter += "^" + IS_ATTESTATION_TASK;
        // }

        var taskTypeFilter = WS.OPERATORS.AND + IS_ATTESTATION_TASK + WS.OPERATORS.OR + IS_APPROVAL_TASK + WS.OPERATORS.OR + IS_CERTIFICATION_TASK;

        var cardsMetadata = [{
                key: CARDS.TOTAL.KEY,
                label: CARDS.TOTAL.LABEL,
                filter: assignmentFilter,
                ariaConfig: CARDS.TOTAL.ARIA_CONFIG,
                selected: true
            },
            {
                key: CARDS.IN_PROGRESS.KEY,
                label: CARDS.IN_PROGRESS.LABEL,
                filter: assignmentFilter + WS.OPERATORS.AND + IS_WORK_IN_PROGRESS,
                ariaConfig: CARDS.IN_PROGRESS.ARIA_CONFIG
            },
            {
                key: CARDS.OVERDUE.KEY,
                label: CARDS.OVERDUE.LABEL,
                filter: assignmentFilter + WS.OPERATORS.AND + IS_NOT_CLOSED + WS.OPERATORS.AND + IS_OVERDUE,
                ariaConfig: CARDS.OVERDUE.ARIA_CONFIG
            },
            {
                key: CARDS.NOT_STARTED.KEY,
                label: CARDS.NOT_STARTED.LABEL,
                filter: assignmentFilter + WS.OPERATORS.AND + IS_OPEN,
                ariaConfig: CARDS.NOT_STARTED.ARIA_CONFIG
            },
			{
				key: CARDS.CLOSED.KEY,
				label: CARDS.CLOSED.LABEL,
				filter: assignmentFilter + WS.OPERATORS.AND + IS_CLOSED,
				ariaConfig: CARDS.CLOSED.ARIA_CONFIG
			}
        ];

        if (isAdmin) {
            cardsMetadata.push({
                key: CARDS.UNASSIGNED.KEY,
                label: CARDS.UNASSIGNED.LABEL,
                filter: IS_NOT_CLOSED + WS.OPERATORS.AND + ASSIGNED_TO_IS_EMPTY + WS.OPERATORS.AND + ASSIGNMENT_GROUP_IS_EMPTY,
                ariaConfig: CARDS.UNASSIGNED.ARIA_CONFIG,
            });
        }

        var taskCounts = CMDBWsDMUtil.getMyWorkTaskCounts(assignmentFilter, isAdmin, input.refresh_timestamp);

        for (var i = 0; i < cardsMetadata.length; i++) {
            cardsMetadata[i].value = taskCounts[cardsMetadata[i].key];
			switch (cardsMetadata[i].key) {
				case CARDS.TOTAL.KEY:
					cardsMetadata[i].ariaConfigContainer = sn_i18n.Message.getMessage("sn_cmdb_ws", "{count} total tasks", {
						count: taskCounts[cardsMetadata[i].key].toString()
					});
					break;
				case CARDS.IN_PROGRESS.KEY:
					cardsMetadata[i].ariaConfigContainer = sn_i18n.Message.getMessage("sn_cmdb_ws", "{count} in progress tasks", {
						count: taskCounts[cardsMetadata[i].key].toString()
					});
					break;
				case CARDS.OVERDUE.KEY:
					cardsMetadata[i].ariaConfigContainer = sn_i18n.Message.getMessage("sn_cmdb_ws", "{count} overdue tasks", {
						count: taskCounts[cardsMetadata[i].key].toString()
					});
					break;
				case CARDS.NOT_STARTED.KEY:
					cardsMetadata[i].ariaConfigContainer = sn_i18n.Message.getMessage("sn_cmdb_ws", "{count} not started tasks", {
						count: taskCounts[cardsMetadata[i].key].toString()
					});
					break;
				case CARDS.UNASSIGNED.KEY:
					cardsMetadata[i].ariaConfigContainer = sn_i18n.Message.getMessage("sn_cmdb_ws", "{count} unassigned tasks", {
						count: taskCounts[cardsMetadata[i].key].toString()
					});
					break;
				case CARDS.CLOSED.KEY:
					cardsMetadata[i].ariaConfigContainer = sn_i18n.Message.getMessage("sn_cmdb_ws", "{count} closed tasks", {
						count: taskCounts[cardsMetadata[i].key].toString()
					});
					break;
				default:
					break;
			}
        }

        var defaultCardFilter = cardsMetadata[0].filter;

        var attestationListConfigMetadata = {
            'default': ACTION_CONFIG.DEFAULT
        };
        attestationListConfigMetadata[CARDS.IN_PROGRESS.KEY] = ACTION_CONFIG.CANCELLABLE_TASK;
        attestationListConfigMetadata[CARDS.NOT_STARTED.KEY] = ACTION_CONFIG.CANCELLABLE_TASK;

        var certificationListConfigMetadata = {
            'default': ACTION_CONFIG.DEFAULT
        };
        certificationListConfigMetadata[CARDS.IN_PROGRESS.KEY] = ACTION_CONFIG.CANCELLABLE_TASK;
        certificationListConfigMetadata[CARDS.NOT_STARTED.KEY] = ACTION_CONFIG.CANCELLABLE_TASK;

        var approvaltaskListConfigMetadata = {
            'default': ACTION_CONFIG.DEFAULT
        };
        approvaltaskListConfigMetadata[CARDS.NOT_STARTED.KEY] = ACTION_CONFIG.CANCELLABLE_TASK;

        var tabsMetadata = [{
                key: TABS.CERTIFICATION_TASKS.KEY,
                label: TABS.CERTIFICATION_TASKS.TAB_LABEL,
                fields: {
                    listTitle: TABS.CERTIFICATION_TASKS.LIST_TITLE,
                    tabFilter: IS_CERTIFICATION_TASK,
                    actionConfig: ACTION_CONFIG.DEFAULT,
                    actionConfigMetadata: certificationListConfigMetadata,
                    updated: Date.now(),
                    view: TABS.CERTIFICATION_TASKS.VIEW
                }
            },
            {
                key: TABS.ATTESTATION_TASKS.KEY,
                label: TABS.ATTESTATION_TASKS.TAB_LABEL,
                fields: {
                    listTitle: TABS.ATTESTATION_TASKS.LIST_TITLE,
                    tabFilter: IS_ATTESTATION_TASK,
                    actionConfig: ACTION_CONFIG.DEFAULT,
                    actionConfigMetadata: attestationListConfigMetadata,
                    updated: Date.now(),
                    view: TABS.ATTESTATION_TASKS.VIEW
                }
            },
            {
                key: TABS.APPROVAL_TASKS.KEY,
                label: TABS.APPROVAL_TASKS.TAB_LABEL,
                fields: {
                    listTitle: TABS.APPROVAL_TASKS.LIST_TITLE,
                    tabFilter: IS_APPROVAL_TASK,
                    actionConfig: ACTION_CONFIG.DEFAULT,
                    actionConfigMetadata: approvaltaskListConfigMetadata,
                    updated: Date.now(),
                    view: TABS.APPROVAL_TASKS.VIEW
                }
            }
        ];

        for (var j = 0; j < tabsMetadata.length; j++) {
            var filter = defaultCardFilter + WS.OPERATORS.AND + tabsMetadata[j].fields.tabFilter;
            tabsMetadata[j].fields.filter = filter;
            tabsMetadata[j].count = taskCounts[tabsMetadata[j].key];
        }

        var certificationExceptionsFilter = '';
        var certificationExceptionsMessage = '';
        if (isAdmin) {
            //TODO: verify if the assignment filter is necessary, if not this will be removed
            //certificationExceptionsFilter = proxy.getTaskAssignmentFilterQuery(DM.CERTIFICATION_ATTRIBUTE_STATUS.TASK);
            //certificationExceptionsFilter += WS.OPERATORS.AND + DM.CERTIFICATION_ATTRIBUTE_STATUS.STATUS + DM.QUERY_FILTERS.EQUAL + DM.CERTIFICATION_ATTRIBUTE_STATUS.STATUS_OPTIONS.FAILED;
            certificationExceptionsFilter += DM.CERTIFICATION_ATTRIBUTE_STATUS.STATUS + DM.QUERY_FILTERS.EQUAL + DM.CERTIFICATION_ATTRIBUTE_STATUS.STATUS_OPTIONS.FAILED;
            var certExceptionCount = CMDBWsDMUtil.getRowCount(DM.CERTIFICATION_ATTRIBUTE_STATUS.TABLE, certificationExceptionsFilter, false);
            if (certExceptionCount > 0) {
                certificationExceptionsMessage = sn_i18n.Message.getMessage("sn_cmdb_ws", "There are {0} certification exceptions", {
                    0: certExceptionCount.toString()
                });
            }
        }

        return {
            cardsMetadata: cardsMetadata,
            tabsMetadata: tabsMetadata,
            updatedTime: sn_i18n.Message.getMessage("sn_cmdb_ws", 'Last updated: {0}', {
                0: taskCounts.updated
            }),
            certificationExceptionsMessage: certificationExceptionsMessage,
            certificationExceptionsFilter: certificationExceptionsFilter
        };
    };

    return new CMDBWsDataBrokerHandler().execute("Get My work page filter metadata", "sn_cmdb_ws_dm", wrapperFn);
}
