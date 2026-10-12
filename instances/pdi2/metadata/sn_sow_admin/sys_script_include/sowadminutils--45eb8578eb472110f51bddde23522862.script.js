var SOWAdminUtils = Class.create();
SOWAdminUtils.prototype = {
    initialize: function() {
        this.CONSTANTS = new SOWAdminConstants();
        this.sowITSMAdminCenterData = new sn_sow_itsm_admin.SOWITSMAdminCenterData();
        this.sowITSMAdminCenterContent = new sn_sow_itsm_admin.SOWITSMAdminCenterContent();
    },

    // Check if plugin is installed or not
    pluginIsInstalled: function(pluginId) {
        return new GlidePluginManager().isActive(pluginId);
    },

    // Generate plugin manager link
    generatePluginInstallLink: function(pluginId) {
        return "/nav_to.do?uri=$allappsmgmt.do?sysparm_search==" + pluginId;
    },

    // Add product documentation link for the given plugin
    addProductDocLink: function(pluginId, pluginName) {
        var ariaLabel = gs.getMessage("Product Documentation for {0}", [pluginName]);
        var hrefAttributes = 'target="_blank" style="color: RGB(var(--now-text-link--primary--color,var(--now-color--secondary-1,1,119,142)));" aria-label="' + ariaLabel + '"';
        if (pluginId == "sn_now_teams_it")
            return '<a href="api/now/v1/context_doc_url/msteams-integ-sow" ' + hrefAttributes + '>' + gs.getMessage("Product Documentation") + '</a>';
        else
            return "";
    },

    // Get the installed store plugin version
    getStorePluginVersion: function(pluginId) {
        var pluginGR = new GlideRecord("sys_store_app");
        pluginGR.addQuery("scope", pluginId);
        pluginGR.query();

        if (pluginGR.next())
            return pluginGR.version.toString();
    },

    // Get the installed family plugin version
    getFamilyPluginVersion: function(pluginId) {
        var pluginGR = new GlideRecord("v_plugin");
        pluginGR.addQuery("id", pluginId);
        pluginGR.query();

        if (pluginGR.next())
            return pluginGR.version.toString();
    },

    // Compare version numbers and return true if verion1 >= version2
    versionCompare: function(version1, version2) {
        var vnum1 = 0,
            vnum2 = 0;
        for (var i = 0, j = 0;
            (i < version1.length || j < version2.length);) {
            while (i < version1.length && version1[i] != '.') {
                vnum1 = vnum1 * 10 + (version1[i] - '0');
                i++;
            }
            while (j < version2.length && version2[j] != '.') {
                vnum2 = vnum2 * 10 + (version2[j] - '0');
                j++;
            }
            if (vnum1 > vnum2)
                return true;
            if (vnum1 < vnum2)
                return false;

            vnum1 = 0, vnum2 = 0;
            i++;
            j++;
        }
        // Both version numbers are equal
        return true;
    },

    // Set application card button label
    setAppButtonLabel: function(pluginId, pluginStatus, pluginName) {
        var labels = {
            label: (pluginStatus) ? gs.getMessage("Configure") : gs.getMessage("Get App"),
            ariaLabel: (pluginStatus) ? gs.getMessage("Configure {0}", [pluginName]) : gs.getMessage("Get {0} App", [pluginName])
        };
        if (pluginId == "sn_oe_sfs" && pluginStatus) {
            var version = this.getStorePluginVersion(pluginId);
            if (!gs.nil(version) && this.versionCompare(version, "2.1.5")) {
                labels.ariaLabel = gs.getMessage("Configure {0}", [pluginName]);
            } else {
                labels.label = gs.getMessage("Update");
                labels.ariaLabel = gs.getMessage("Update {0}", [pluginName]);
            }
        }
        return labels;
    },

    // Set application card button payload
    setAppButtonPayload: function(pluginId, pluginStatus, configRedirectLink) {
        if (pluginId == "sn_oe_sfs") {
            if (pluginStatus) {
                var version = this.getStorePluginVersion(pluginId);
                if (!gs.nil(version) && this.versionCompare(version, "2.1.5"))
                    return configRedirectLink;
            }
            return this.generatePluginInstallLink(pluginId);
        } else {
            return (pluginStatus) ? configRedirectLink : this.generatePluginInstallLink(pluginId);
        }
    },

    // Retrieve list of additional related apps in interactive cards list format
    getAdditionalSetupList: function() {
        var cardsPayloadObj = {};
        var cardsList = [];
        var additional_apps_list = this.sowITSMAdminCenterData.getAdditionalApps();

        // Iterate over all entries
        for (const app of additional_apps_list) {
            var pluginId = app["plugin_id"];
            var pluginStatus = this.pluginIsInstalled(app["plugin_id"]);
            var pluginName = app["plugin_name"];
            var btnLabels = this.setAppButtonLabel(pluginId, pluginStatus, pluginName);
            var obj = this.CONSTANTS.BASE_INTERACTIVE_CARD_OBJECT;
            var highlighted_color_plugin_installed = app["HIGHLIGHTED_COLOR_PLUGIN_INSTALLED"] || "info";
            var highlighted_color_plugin_not_installed = app["HIGHLIGHTED_COLOR_PLUGIN_NOT_INSTALLED"] || "critical";
            var highlighted_icon_plugin_installed = app["HIGHLIGHTED_ICON_PLUGIN_INSTALLED"] || "circle-check-outline";
            var highlighted_icon_plugin_not_installed = app["HIGHLIGHTED_ICON_PLUGIN_NOT_INSTALLED"] || "presence-offline-outline";
            var highlighted_variant = app["HIGHLIGHTED_VARIANT"] || "tertiary";
            obj.title = app["plugin_name"];
            obj.image = app["image"];
            obj.alt = sn_i18n.Message.getMessage("sn_sow_admin", "{pluginName} icon", {
                pluginName: app["plugin_name"]
            });
            obj.button_action_type = app["button_action_type"] || "link";
            obj.button_action_payload = this.setAppButtonPayload(pluginId, pluginStatus, app["config_redirection_link"]);
            obj.button_text = btnLabels.label;
            obj.button_type = "tertiary";
            obj.button_tooltip_label = btnLabels.label + ' ' + app["plugin_name"];
            obj.highlighted_color = (pluginStatus) ? highlighted_color_plugin_installed : highlighted_color_plugin_not_installed;
            obj.highlighted_icon = (pluginStatus) ? highlighted_icon_plugin_installed : highlighted_icon_plugin_not_installed;
            obj.highlighted_label = (pluginStatus) ? gs.getMessage("Installed") : gs.getMessage("Not installed");
            obj.highlighted_variant = highlighted_variant;
            obj.interaction = "none_bordered";
            obj.body = '<p>' + app["description"] + " " + this.addProductDocLink(pluginId, pluginName) + '</p>';
            obj.aria_properties = JSON.parse(JSON.stringify(app["ARIA_PROPERTIES"] || {}));
            if (obj.aria_properties.button) {
                obj.aria_properties.button["aria-label"] = btnLabels.ariaLabel;
            } else {
                obj.aria_properties["button"] = {
                    "aria-label": btnLabels.ariaLabel
                };
            }
            cardsList.push(JSON.parse(JSON.stringify(obj)));
        }

        cardsPayloadObj.cards_list = cardsList;
        return cardsPayloadObj;
    },

    getITSMCoreApps: function() {
        var itsmCoreApps = this.sowITSMAdminCenterData.getITSMCoreApps();
        for (const obj of itsmCoreApps) {
            obj.action_tooltip = sn_i18n.Message.getMessage("sn_sow_admin", "Install {moduleName}", {
                moduleName: obj.module_name
            });
            obj.action_aria_label = sn_i18n.Message.getMessage("sn_sow_admin", "Install {moduleName}", {
                moduleName: obj.module_name
            });
            obj.post_action_tooltip = sn_i18n.Message.getMessage("sn_sow_admin", "Configure {moduleName}", {
                moduleName: obj.module_name
            });
            obj.image_alt = sn_i18n.Message.getMessage("sn_sow_admin", "{moduleName} image", {
                moduleName: obj.module_name
            });
        }

        return itsmCoreApps;
    },

    getFAQs: function() {
        return this.sowITSMAdminCenterContent.getFAQs();
    },

    getResourcesList: function() {
        var resourcesList = this.sowITSMAdminCenterData.getResourcesList();
        for (const obj of resourcesList) {
            obj.button_aria_properties = sn_i18n.Message.getMessage("sn_sow_admin", "View details of {moduleName}", {
                moduleName: obj.module_name
            });
            obj.image_alt = sn_i18n.Message.getMessage("sn_sow_admin", "{moduleName} image", {
                moduleName: obj.module_name
            });
        }

        return resourcesList;
    },

    getHelpfulLinks: function() {
        return this.sowITSMAdminCenterContent.getHelpfulLinks();
    },

    type: 'SOWAdminUtils'
};
