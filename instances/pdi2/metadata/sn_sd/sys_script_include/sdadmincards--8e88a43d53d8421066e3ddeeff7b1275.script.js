var SDAdminCards = Class.create();
SDAdminCards.prototype = {
    initialize: function() {
        this.sdAdminUtils = new sn_sd.SDAdminUtils();
        this.sdAdminHelper = new sn_sd.SDAdminHelper();
        this.sdRolesUtils = new sn_sd.SDRolesUtility();
        this.sdConstants = new sn_sd.SDConstants();
        this.HIGHLIGHTED_TEXT_ALL_SET = {
            "label": gs.getMessage("All set"),
            "color": "positive"
        };
        this.HIGHLIGHTED_TEXT_CONFIG_NEEDED = {
            "label": gs.getMessage("Configuration needed"),
            "color": "critical"
        };
        this.isSameScope = true;
    },

    buildSDPage: function(serviceGroup) {
        var sg = this.sdAdminUtils.getServiceGroups(),
            scope = "";
        if (!serviceGroup) serviceGroup = sg[0].id;

        //Checks if current scope is same as service group scope
        var grServiceGroup = new GlideRecord('sn_sd_service_group');
        grServiceGroup.addQuery('sys_id', serviceGroup);
        grServiceGroup.query();
        grServiceGroup.setLimit(1);
        if (grServiceGroup.next())
            scope = grServiceGroup.getValue("sys_scope").toString();
        this.isSameScope = (scope == gs.getCurrentApplicationId());
        this.hasAdminRole = gs.hasRole('admin, sn_sd.success_dashboard_admin');
        return {
            "serviceGroups": sg,
            "selectedServiceGroup": [serviceGroup],
            "advanceItems": this.getSDAdvanceCards(),
            "prerequisitesData": this.getSDPrerequisitesCard(serviceGroup)
        };
    },

    getSDAdvanceCards: function() {
        var details = [{
                "heading": gs.getMessage("System properties"),
                "description": gs.getMessage("Modify the base system feature behaviour by customising the system properties based on your organisation requirements."),
                "buttonConfig": {
                    "label": gs.getMessage("Configure"),
                    "config": "SD_CONFIGURE_SYS_PROP",
                    "tooltipContent": gs.getMessage("Configure system properties"),
                    "configAria": {
                        "button": {
                            "aria-description": gs.getMessage("Button to open system properties page"),
                            "aria-label": gs.getMessage("Button to open system properties page")
                        }
                    },
                    "disabled": false
                }
            },
            {
                "heading": gs.getMessage("Key performance indicators (KPIs)"),
                "description": gs.getMessage("Review the available KPIs and its properties with the base system and configure different aspects of these KPIs as per your organisation requirements."),
                "buttonConfig": {
                    "label": gs.getMessage("Configure"),
                    "config": "SD_CONFIGURE_KPI",
                    "tooltipContent": gs.getMessage("Configure key performance indicators"),
                    "configAria": {
                        "button": {
                            "aria-description": gs.getMessage("Button to open key performance indicators page"),
                            "aria-label": gs.getMessage("Button to open key performance indicators page")
                        }
                    },
                    "disabled": false
                }
            }
        ];
        return details;
    },

    getSDPrerequisitesCard: function(serviceGroup) {
        var cards = [];
        cards.push(this.getUserRolesCard(this.sdRolesUtils.getSDRolesList().join(','), 'SD_CONFIGURE_USER_ROLES'));
        cards.push(this.getKBDeflectionCard(serviceGroup, 'SD_CONFIGURE_KB_DEFLECTION'));
        cards.push(this.getVADeflectionCard(serviceGroup, 'SD_CONFIGURE_VA_DEFLECTION'));
        cards.push(this.getCatItemFulfilmentCard(serviceGroup, 'SD_CONFIGURE_CATALOG_ITEM_FULFILMENT_LEVEL'));
        cards.push(this.getPAIndJobsCard(serviceGroup, 'SD_CONFIGURE_PA_JOBS'));
        var pmCard = this.getProcessMiningCard(serviceGroup, 'SD_CONFIGURE_PROCESS_MINING');
        if (pmCard)
            cards.push(pmCard);
        return cards;
    },

    getVADeflectionCard: function(serviceGroup, event) {
        var disabled = !(new GlidePluginManager().isActive(SDConstants.vaPlugins[serviceGroup]) && this.hasAdminRole),
            count = this.sdAdminHelper.getVATopicsCount(serviceGroup);
        return {
            "heading": gs.getMessage("Virtual Agent deflection"),
            "description": gs.getMessage("Configure the VA topics to determine the self-solved using VA conversations. Base system configuration depends on selected service group."),
            "buttonConfig": {
                "label": gs.getMessage("Review and Configure"),
                "config": event,
                "tooltipContent": this.hasAdminRole ? gs.getMessage("Review and Configure Virtual Agent deflection configuration") : gs.getMessage("This configuration can be updated by the administrator. Please contact your administrator for more information."),
                "configAria": {
                    "button": {
                        "aria-description": gs.getMessage("Button to open Virtual Agent deflection configuration page"),
                        "aria-label": gs.getMessage("Button to open Virtual Agent deflection configuration page")
                    }
                },
                "disabled": disabled
            },
            "scoreData": {
                "title": gs.getMessage("# Topics instrumented by deflection nodes"),
                "score": count
            },
            "highlightedText": (count > 0) ? this.HIGHLIGHTED_TEXT_ALL_SET : this.HIGHLIGHTED_TEXT_CONFIG_NEEDED
        };
    },

    getKBDeflectionCard: function(serviceGroup, event) {
        var count = this.sdAdminHelper.getKBArticlesCount(serviceGroup);
        return {
            "heading": gs.getMessage("Knowledge deflection"),
            "description": gs.getMessage("Includes only the relevant knowledge bases while determining the self-solved using Knowledge. Knowledge base articles related to service group are included as part of the base system configuration."),
            "buttonConfig": {
                "label": gs.getMessage("Review and Configure"),
                "config": event,
                "tooltipContent": this.hasAdminRole ? gs.getMessage("Review and Configure Knowledge deflection configuration") : gs.getMessage("This configuration can be updated by the administrator. Please contact your administrator for more information."),
                "configAria": {
                    "button": {
                        "aria-description": gs.getMessage("Button to open Knowledge deflection configuration page"),
                        "aria-label": gs.getMessage("Button to open Knowledge deflection configuration page")
                    }
                },
                "disabled": this.hasAdminRole ? false : true
            },
            "scoreData": {
                "title": gs.getMessage("# KB articles considered"),
                "score": count
            },
            "highlightedText": (count > 0) ? this.HIGHLIGHTED_TEXT_ALL_SET : this.HIGHLIGHTED_TEXT_CONFIG_NEEDED
        };
    },

    getCatItemFulfilmentCard: function(serviceGroup, event) {
        var percentageOfFullyAutomatedCatItem = this.sdAdminUtils.getPercentageOfFullyAutomatedCatItem();
        return {
            "heading": gs.getMessage("Catalog Item fulfillment level"),
            "description": gs.getMessage("Set the fulfillment automation level of catalog items that are fulfilled without any manual intervention to Fully-automated."),
            "buttonConfig": {
                "label": gs.getMessage("Configure"),
                "config": event,
                "tooltipContent": gs.getMessage("Configure catalog item fulfillment level configuration"),
                "configAria": {
                    "button": {
                        "aria-description": gs.getMessage("Button to open catalog item fulfillment level configuration page"),
                        "aria-label": gs.getMessage("Button to open catalog item fulfillment level configuration page")
                    }
                },
                "disabled": false
            },
            "scoreData": {
                "title": gs.getMessage("% Fully automated catalog items"),
                "score": percentageOfFullyAutomatedCatItem + '%'
            },
            "highlightedText": (percentageOfFullyAutomatedCatItem > 0) ? this.HIGHLIGHTED_TEXT_ALL_SET : this.HIGHLIGHTED_TEXT_CONFIG_NEEDED
        };
    },

    getProcessMiningCard: function(serviceGroup, event) {
        if (!gs.tableExists(SDConstants.tableNames.CONTRIBUTINGINDICATORM2MPOPROJECT)) return '';
        var disabled = !new GlidePluginManager().isActive(SDConstants.pmPlugins[serviceGroup]),
            pmCount = this.sdAdminUtils.getProcessMiningCounts(serviceGroup);
        return {
            "heading": gs.getMessage("Process Mining projects"),
            "description": gs.getMessage("Review and configure Process Mining projects that helps analyse the bottlenecks in the existing process. Out of the box, these projects are already mapped to Service Quality metrics in Success Dashboard."),
            "buttonConfig": {
                "label": disabled ? gs.getMessage("Review") : gs.getMessage("Review and Configure"),
                "config": event,
                "tooltipContent": gs.getMessage("Review and Configure Process Mining projects"),
                "configAria": {
                    "button": {
                        "aria-description": gs.getMessage("Button to open Process Mining projects page"),
                        "aria-label": gs.getMessage("Button to open Process Mining projects page")
                    }
                },
                "disabled": disabled
            },
            "scoreData": {
                "title": gs.getMessage("# Indicators with PM projects mapped"),
                "score": pmCount
            },
            "highlightedText": (pmCount > 0) ? this.HIGHLIGHTED_TEXT_ALL_SET : this.HIGHLIGHTED_TEXT_CONFIG_NEEDED
        };
    },

    getPAIndJobsCard: function(serviceGroup, event) {
        var paContrInd = this.sdAdminUtils.getAllPAContributingIndcators(serviceGroup),
            inactivePAJobs = this.sdAdminUtils.getPAJobsCount(paContrInd).inactivePAJobs;
        return {
            "heading": gs.getMessage("Performance Analytics (PA) jobs"),
            "description": gs.getMessage("Review and activate PA jobs to collect daily and historical data for the Success Dashboard indicators."),
            "buttonConfig": {
                "label": gs.getMessage("Activate PA jobs"),
                "config": event,
                "tooltipContent": gs.getMessage("Review and Configure PA jobs"),
                "configAria": {
                    "button": {
                        "aria-description": gs.getMessage("Button to open PA jobs page"),
                        "aria-label": gs.getMessage("Button to open PA jobs page")
                    }
                },
                "disabled": paContrInd ? false : true
            },
            "scoreData": {
                "title": gs.getMessage("# Inactive jobs"),
                "score": inactivePAJobs
            },
            "highlightedText": (inactivePAJobs > 0) ? this.HIGHLIGHTED_TEXT_CONFIG_NEEDED : this.HIGHLIGHTED_TEXT_ALL_SET
        };
    },

    getUserRolesCard: function(rolesSysID, event) {
        var usersCount = this.sdAdminUtils.getUsersCount(rolesSysID);
        return {
            "heading": gs.getMessage("User roles"),
            "description": gs.getMessage("Assign different roles based on their respective access requirements."),
            "buttonConfig": {
                "label": gs.getMessage("Configure"),
                "config": event,
                "tooltipContent": gs.getMessage("Review and Configure users with Success Dashboard roles"),
                "configAria": {
                    "button": {
                        "aria-description": gs.getMessage("Button to open user roles page"),
                        "aria-label": gs.getMessage("Button to open user roles page")
                    }
                },
                "disabled": false
            },
            "scoreData": {
                "title": gs.getMessage("# Users with Success Dashboard roles"),
                "score": usersCount
            },
            "highlightedText": (usersCount > 0) ? this.HIGHLIGHTED_TEXT_ALL_SET : this.HIGHLIGHTED_TEXT_CONFIG_NEEDED
        };
    },
    type: 'SDAdminCards'
};
