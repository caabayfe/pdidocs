var SOWITSMAdminCenterData = Class.create();
SOWITSMAdminCenterData.prototype = {
    initialize: function() {
        this.ADDITIONAL_SETUP_APPS = [];
        this.ITSM_CORE_APPS = [];
        this.RESOURCES_APPS = [];
    },

    getTranslation: function(key) {
        switch (key) {
            case 'AI_SEARCH':
                return {
                    "plugin_name": sn_i18n.Message.getMessage("sn_sow_itsm_admin", "AI Search"),
                    "description": sn_i18n.Message.getMessage("sn_sow_itsm_admin", "AI Search plugin installs and enables AI Search capabilities, providing relevant, contextual and personal search experiences across different interfaces.")
                };
            case 'IT_SERVICE_MANAGEMENT_INTEGRATION_WITH_MICROSOFT_TEAMS':
                return {
                    "plugin_name": sn_i18n.Message.getMessage("sn_sow_itsm_admin", "IT Service Management Integration with Microsoft Teams"),
                    "description": sn_i18n.Message.getMessage("sn_sow_itsm_admin", "This plugin provides agents the ability to initiate a Microsoft Teams chat with an employee from an incident, change request, and request item.")
                };
            case 'ADVANCED_WORK_ASSIGNMENT':
                return {
                    "plugin_name": sn_i18n.Message.getMessage("sn_sow_itsm_admin", "Advanced Work Assignment"),
                    "description": sn_i18n.Message.getMessage("sn_sow_itsm_admin", "Use Advanced Work Assignment (AWA) to automatically assign work items to your agents, based on their availability, capacity, and optionally, skills.")
                };
            case 'SIDEBAR':
                return {
                    "plugin_name": sn_i18n.Message.getMessage("sn_sow_itsm_admin", "Sidebar"),
                    "description": sn_i18n.Message.getMessage("sn_sow_itsm_admin", "Using Sidebar, agents can have real-time collaboration with others based around a Workspace task-based or interaction-based record.")
                };
            case 'DEVOPS_CHANGE_VELOCITY':
                return {
                    "plugin_name": sn_i18n.Message.getMessage("sn_sow_itsm_admin", "DevOps Change Velocity"),
                    "description": sn_i18n.Message.getMessage("sn_sow_itsm_admin", "DevOps Change Velocity is built on a powerful data model that connects tools to change management for automatic ticketing and approval.")
                };
            case 'INITIAL_SETUP':
                return {
                    "module_name": sn_i18n.Message.getMessage("sn_sow_itsm_admin", "Initial setup"),
                    "description": sn_i18n.Message.getMessage("sn_sow_itsm_admin", "Configure the landing page and the contextual side panel to start setting up your Service Operations Workspace."),
                };

            case 'MIGRATE_FROM_ITSM_AGENT_WORKSPACE_TO_SOW':
                return {
                    "module_name": sn_i18n.Message.getMessage("sn_sow_itsm_admin", "Migrate from ITSM Agent Workspace to SOW"),
                    "description": sn_i18n.Message.getMessage("sn_sow_itsm_admin", "Migrate your configurations from ITSM Agent Workspace to Service Operations Workspace.")
                };
            case 'INCIDENT_MANAGEMENT':
                return {
                    "module_name": sn_i18n.Message.getMessage("sn_sow_itsm_admin", "Incident Management"),
                    "description": sn_i18n.Message.getMessage("sn_sow_itsm_admin", "Quickly restore normal service operation while minimizing the impact to business operations and maintaining quality.")
                };
            case 'PROBLEM_MANAGEMENT':
                return {
                    "module_name": sn_i18n.Message.getMessage("sn_sow_itsm_admin", "Problem Management"),
                    "description": sn_i18n.Message.getMessage("sn_sow_itsm_admin", "Understand what is causing issues in your service operations so you can prevent similar issues from occurring in the future.")
                };
            case 'CHANGE_MANAGEMENT':
                return {
                    "module_name": sn_i18n.Message.getMessage("sn_sow_itsm_admin", "Change Management"),
                    "description": sn_i18n.Message.getMessage("sn_sow_itsm_admin", "Apply fixes quickly to restore normal service operations while remaining in compliance with your organization’s change processes and governance.")
                };
            case 'MIM':
                return {
                    "module_name": sn_i18n.Message.getMessage("sn_sow_itsm_admin", "Major Incident Management"),
                    "description": sn_i18n.Message.getMessage("sn_sow_itsm_admin", "Add rigor to and drive faster resolution of incidents that have the most impact you and your customers."),
                    "plugin_name": sn_i18n.Message.getMessage("sn_sow_itsm_admin", "Major Incident Management for Service Operations Workspace")
                };
            case 'SRM':
                return {
                    "module_name": sn_i18n.Message.getMessage("sn_sow_itsm_admin", "Service Reliability Management"),
                    "description": sn_i18n.Message.getMessage("sn_sow_itsm_admin", "Help your teams increase reliability while managing system health and resolving issues faster. Plus, a smoother onboarding for new team members.")
                };
            case 'SO':
                return {
                    "module_name": sn_i18n.Message.getMessage("sn_sow_itsm_admin", "Service Observability"),
                    "description": sn_i18n.Message.getMessage("sn_sow_itsm_admin", "Link third party metrics to your services to help your teams better monitor service health. Plus, manage user roles.")
                };
            case 'SERVICE_DESK_ASSISTED_PASSWORD_RESET':
                return {
                    "module_name": sn_i18n.Message.getMessage("sn_sow_itsm_admin", "Assisted Password Reset"),
                    "description": sn_i18n.Message.getMessage("sn_sow_itsm_admin", "Set up Service Desk process and other configurations to allow your agents to reset passwords.")
                };
            case 'INTERACTION_MANAGEMENT':
                return {
                    "module_name": sn_i18n.Message.getMessage("sn_sow_itsm_admin", "Interaction Management"),
                    "description": sn_i18n.Message.getMessage("sn_sow_itsm_admin", "One place for all your customer communication needs, including chat, phone, email, and walk-ups.")
                };
            case 'SOW_CONFIGURATION_GUIDE':
                return {
                    "module_name": sn_i18n.Message.getMessage("sn_sow_itsm_admin", "SOW configuration guide"),
                    "description": sn_i18n.Message.getMessage("sn_sow_itsm_admin", "<p style='margin-block:0.5rem;'>Get a comprehensive overview of essential configuration activities to set up Service Operations Workspace (SOW).</p>")
                };
            case 'SOW_COMMUNITY_FORUM':
                return {
                    "module_name": sn_i18n.Message.getMessage("sn_sow_itsm_admin", "SOW community forum"),
                    "description": sn_i18n.Message.getMessage("sn_sow_itsm_admin", "<p style='margin-block:0.5rem;'>Have a question? Discuss and share insights with other members of the SOW community to enhance your ServiceNow experience.</p>")
                };
            case 'LAUNCH_AND_LEARN_WEBINAR':
                return {
                    "module_name": sn_i18n.Message.getMessage("sn_sow_itsm_admin", '"Launch and learn" webinar'),
                    "description": sn_i18n.Message.getMessage("sn_sow_itsm_admin", '<p style="margin-block:0.5rem;">Explore our recorded "Launch and Learn" webinars to gain deeper insights into each feature\'s purpose, functionality, and importance.</p>')
                };
            case 'STORE_RELEASE_NOTES':
                return {
                    "module_name": sn_i18n.Message.getMessage("sn_sow_itsm_admin", "Store release notes"),
                    "description": sn_i18n.Message.getMessage("sn_sow_itsm_admin", "<p style='margin-block:0.5rem;'>Discover the latest capabilities in our store release. For even more enhancements, check out the most recent Now Platform <a href='https://docs.servicenow.com/bundle/xanadu-release-notes/page/release-notes/family-release-notes.html' style='text-decoration: underline;color: RGB(var(--now-color_text--primary, 22, 27, 28));' target='_blank'>family release</a>.</p>")
                };
            case 'SYNTHETIC_MONITORING':
                return {
                    "module_name": sn_i18n.Message.getMessage("sn_sow_synthetics", "Synthetic Monitoring"),
                    "description": sn_i18n.Message.getMessage("sn_sow_synthetics", "Set up and manage user roles and monitoring locations to ensure Synthetic Monitoring is aligned with your team’s workflows and requirements.")
                };
            case 'ON_CALL_SCHEDULING':
                return {
                    "module_name": sn_i18n.Message.getMessage("sn_sow_itsm_admin", "On-Call Scheduling"),
                    "description": sn_i18n.Message.getMessage("sn_sow_itsm_admin", "Configure On-Call Scheduling properties, templates, trigger rules, escalation policies, rosters, and schedules to enhance the effectiveness of roster members and shift managers.")
                };
            case 'NOTIFY':
                return {
                    "module_name": sn_i18n.Message.getMessage("sn_sow_itsm_admin", "Notify"),
                    "description": sn_i18n.Message.getMessage("sn_sow_itsm_admin", "Integrate multiple Notify providers and customize notification settings for seamless internal team and customer communication across various channels.")
                };
            default:
                return;
        }
    },

    // Check if plugin is installed or not
    pluginIsInstalled: function(pluginId) {
        return new GlidePluginManager().isActive(pluginId);
    },

    isAWActive: function() {
        var isAWActive = true;
        var isAWPluginActive = GlidePluginManager.isActive('com.agent_workspace');
        var awConfigGR = new GlideRecord('sys_aw_master_config');
        var pageRegistryGR = new GlideRecord('sys_ux_page_registry');
        if (isAWPluginActive && awConfigGR.get('7b24ceae5304130084acddeeff7b12a3') && pageRegistryGR.get('09d6f2c28727030084aca571d5cb0b5b')) { // // AW_CONFIG and AW_PAGE_REGISTRY
            var isWorkspaceActive = awConfigGR.active;
            var isUXAppActive = pageRegistryGR.active;
            isAWActive = isAWPluginActive && isWorkspaceActive && isUXAppActive;
        } else isAWActive = false;
        return isAWActive;
    },

    evaluateScript: function(script) {
        var evaluator = new GlideScopedEvaluator();
        var contentBlockGR = new GlideRecord('sn_ace_content_block');
        contentBlockGR.get('216afd239348121004e40b27648918dc'); // content block sys_id - created for evaluating the script
        contentBlockGR.lazy_script = script;
        return evaluator.evaluateScript(contentBlockGR, "lazy_script");
    },
    getAdditionalApps: function() {
        var additionalAppsGR = new GlideRecord('sn_sow_cfg_stg');
        additionalAppsGR.addQuery('group', '04d462b29340121004e40b276489182f'); // Additional setup - configuration group sys_id
        additionalAppsGR.addActiveQuery();
        additionalAppsGR.orderBy('order');
        additionalAppsGR.query();
        while (additionalAppsGR.next()) {
            try {
                var obj = JSON.parse(additionalAppsGR.getValue('value'));
                var translationObj = this.getTranslation(additionalAppsGR.getValue('key'));
                for (var key in translationObj) {
                    obj[key] = translationObj[key];
                }
                this.ADDITIONAL_SETUP_APPS.push(obj);
            } catch (parseError) {
                gs.error('Exception {0} occured while processing record of {1}', parseError.toString(), additionalAppsGR.getUniqueValue());
            }
        }
        return this.ADDITIONAL_SETUP_APPS;
    },

    getITSMCoreApps: function() {
        var itsmCoreAppsGR = new GlideRecord('sn_sow_cfg_stg');
        itsmCoreAppsGR.addQuery('group', '620522b29340121004e40b27648918b3'); // Configure ITSM - configuration group sys_id
        itsmCoreAppsGR.orderBy('order');
        itsmCoreAppsGR.addActiveQuery();
        itsmCoreAppsGR.query();
        while (itsmCoreAppsGR.next()) {
            try {
                var obj = JSON.parse(itsmCoreAppsGR.getValue('value'));
                if (obj.conditions && !this.evaluateScript(obj.conditions)) continue;
                var plugin_obj = {};
                plugin_obj[obj.plugin_id] = "plugin";
                if (obj.application_id) {
                    var application_obj = {};
                    application_obj[obj.application_id] = "application";

                    obj.plugin = this.pluginIsInstalled(obj.plugin_id) ? JSON.stringify(plugin_obj) : JSON.stringify(application_obj);

                } else {
                    obj.plugin = JSON.stringify(plugin_obj);
                }
                var translationObj = this.getTranslation(itsmCoreAppsGR.getValue('key'));
                for (var key in translationObj) {
                    obj[key] = translationObj[key];
                }
                this.ITSM_CORE_APPS.push(obj);
            } catch (parseError) {
                gs.error('Exception {0} occured while processing record of {1}', parseError.toString(), itsmCoreAppsGR.getUniqueValue());
            }
        }
        return this.ITSM_CORE_APPS;
    },

    getResourcesList: function() {
        var resourcesGR = new GlideRecord('sn_sow_cfg_stg');
        resourcesGR.addQuery('group', '9d1726f593d8121004e40b27648918d7'); // Learning - configuration group sys_id
        resourcesGR.orderBy('order');
        resourcesGR.addActiveQuery();
        resourcesGR.query();
        while (resourcesGR.next()) {
            try {
                var obj = JSON.parse(resourcesGR.getValue('value'));
                var translationObj = this.getTranslation(resourcesGR.getValue('key'));
                for (var key in translationObj) {
                    obj[key] = translationObj[key];
                }
                this.RESOURCES_APPS.push(obj);
            } catch (parseError) {
                gs.error('Exception {0} occured while processing record of {1}', parseError.toString(), resourcesGR.getUniqueValue());
            }
        }
        return this.RESOURCES_APPS;
    },

    type: 'SOWITSMAdminCenterData'
};
