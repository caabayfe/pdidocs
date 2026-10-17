(function(context, pageParams) {
    /*   context = {    'block_id': @sysId,    'name': @String,    'title': @String,    'subtitle': @String,    'order': @Number,    'type': @Object,    'children': @Array[context],    'props_details': @Object   };  */
    // get vsc textbox card
    function getTextboxCard(configName, configComplianceState, configDescription, currentValue, order, isNonOverridable) {
        return {
            block_id: 'block_' + gs.generateGUID(),
            name: 'card_' + gs.generateGUID(),
            title: configName,
            subtitle: '',
            order: order,
            type: {
                group: "Card",
                name: "VSC Textbox Card",
                group_id: "a1e74239c3e401104b8e88c7c840dd05",
                id: "fd7006798794111061ee083f37cb0b5c",
                route: "sc-textbox-card",
                props: []
            },
            children: [],
            props_details: {
                property_name: configName,
                compliance_state: configComplianceState,
                recommended_description: configDescription,
                current_value: currentValue,
                is_non_overridable: isNonOverridable
            }
        };
    }

    // get vsc toggle card
    function getToggleCard(configName, configComplianceState, configDescription, currentValue, order) {
        return {
            block_id: 'block_' + gs.generateGUID(),
            name: 'card_' + gs.generateGUID(),
            title: configName,
            subtitle: '',
            order: order,
            type: {
                group: "Card",
                name: "VSC Toggle Card",
                group_id: "a1e74239c3e401104b8e88c7c840dd05",
                id: "a940c2798794111061ee083f37cb0b2f",
                route: "sc-toggle-card",
                props: []
            },
            children: [],
            props_details: {
                property_name: configName,
                compliance_state: configComplianceState,
                recommended_description: configDescription,
                current_value: currentValue
            }
        };
    }

    // get vsc plugin card
    function getPluginCard(configName, configComplianceState, pluginLink, pluginStatus, order, configDescription) {
        return {
            block_id: 'block_' + gs.generateGUID(),
            name: 'card_' + gs.generateGUID(),
            title: configName,
            subtitle: '',
            order: order,
            type: {
                group: "Card",
                name: "VSC Plugin Card",
                group_id: "a1e74239c3e401104b8e88c7c840dd05",
                id: "2cb7c6fd8794111061ee083f37cb0b6d",
                route: "sc-plugin-card",
                props: []
            },
            children: [],
            props_details: {
                property_name: configName,
                compliance_state: configComplianceState,
                plugin_status: pluginStatus,
                plugin_link: pluginLink,
                recommended_description: configDescription
            }
        };
    }

    // get vsc button card
    function getButtonCard(configName, configComplianceState, configDescription, tableLink, order) {
        return {
            block_id: 'block_' + gs.generateGUID(),
            name: 'card_' + gs.generateGUID(),
            title: configName,
            subtitle: '',
            order: order,
            type: {
                group: "Card",
                name: "VSC Button Card",
                group_id: "a1e74239c3e401104b8e88c7c840dd05",
                id: "99c7c6fd8794111061ee083f37cb0b38",
                route: "sc-button-card",
                props: []
            },
            children: [],
            props_details: {
                property_name: configName,
                compliance_state: configComplianceState,
                recommended_description: configDescription,
                table_link: tableLink
            }
        };
    }

    // get vsc heading card
    function getHeadingCard(complianceState) {
        return {
            block_id: 'block_' + gs.generateGUID(),
            name: 'heading_' + gs.generateGUID(),
            title: '',
            subtitle: '',
            order: 1,
            type: {
                group: "Card",
                name: "SC-Hardening Settings Heading",
                group_id: "a1e74239c3e401104b8e88c7c840dd05",
                id: "541680318720511061ee083f37cb0b01",
                route: "hardening-settings-heading",
                props: []
            },
            children: [],
            props_details: {
                compliance_state: complianceState
            }
        };
    }

    // get vsc heading card
    function getORCard(order) {
        return {
            block_id: 'block_' + gs.generateGUID(),
            name: 'OR_' + gs.generateGUID(),
            title: '',
            subtitle: '',
            order: order,
            type: {
                group: "Card",
                name: "VSC OR Card",
                group_id: "a1e74239c3e401104b8e88c7c840dd05",
                id: "45c2f5bf4db01110f8778d318544a9a0",
                route: "sc-or-card",
                props: []
            },
            children: [],
            props_details: {}
        };
    }

    // get vsc heading card
    function getANDCard(order) {
        return {
            block_id: 'block_' + gs.generateGUID(),
            name: 'AND_' + gs.generateGUID(),
            title: '',
            subtitle: '',
            order: order,
            type: {
                group: "Card",
                name: "VSC AND Card",
                group_id: "a1e74239c3e401104b8e88c7c840dd05",
                id: "32d2b5bf4db01110f8778d318544a9dd",
                route: "sc-and-card",
                props: []
            },
            children: [],
            props_details: {}
        };
    }

    // Code starts here.
    // Get all hardening settings with configurations and groups
    var order = 10;
    var settingsId = context.pageParams && context.pageParams.sysId;
    var hardeningArray = [];
    var grConfigs = new GlideRecord("sn_vsc_instance_hardening_settings");
    grConfigs.addEncodedQuery("sys_id=" + settingsId);
    grConfigs.query();
    while (grConfigs.next()) {
        var configurations = {};
        configurations.compliance_status = grConfigs.getDisplayValue("compliance_status").toString();
        configurations.check_name = grConfigs.check.toString();
        configurations.sys_id = grConfigs.getDisplayValue("sys_id");
        configurations.groups = getGroups(configurations);
        var complianceStatus = configurations.compliance_status;
        context.children.push(getHeadingCard(complianceStatus));
        hardeningArray.push(configurations);
        for (var i = 0; i < hardeningArray.length; i++) {
            var groups = hardeningArray[i].groups;
            var groupCount = groups.length;
            for (var dep in groups) {
                var dependency = groups[dep].dependencies;
                var dependencyCount = dependency.length;
                for (var d in dependency) {
                    var configStatus = dependency[d].config_configure.toString() == "false" ? "Not compliant" : "Compliant";
                    if (dependency[d].recommendedType.includes("toggle")) {    
                        context.children.push(getToggleCard(dependency[d].name.toString(), configStatus, dependency[d].config_description.toString(), dependency[d].config_current_value, order++));
                    } else if (dependency[d].recommendedType.includes("textbox")) {
                        context.children.push(getTextboxCard(dependency[d].name.toString(), configStatus, dependency[d].config_description.toString(), dependency[d].config_current_value, order++, false));
                    } else if (dependency[d].recommendedType.includes("button")) {
                        if (dependency[d].config_link.contains("v_plugin")) {
                            var pluginStatus = dependency[d].config_configure.toString() == "false" ? gs.getMessage("Plugin not installed") : gs.getMessage("Plugin installed");
                            context.children.push(getPluginCard(dependency[d].name.toString(), configStatus, dependency[d].config_link.toString(), pluginStatus, order++, dependency[d].config_description.toString()));
                        } else {
                            context.children.push(getButtonCard(dependency[d].name.toString(), configStatus, dependency[d].config_description.toString(), dependency[d].config_link.toString(), order++));
                        }
                    } else if (dependency[d].recommendedType.includes("non_overridable")) {
                        context.children.push(getTextboxCard(dependency[d].name.toString(), configStatus, dependency[d].config_description.toString(), dependency[d].config_current_value, order++, true));
                    }
                    // add AND Condition card
                    if (dependencyCount > 1 && groupCount > 1) {
                        context.children.push(getANDCard(order++));
                        dependencyCount--;
                    }
                }
                // Add OR Condition card
                if (groupCount > 1) {
                    context.children.push(getORCard(order++));
                    groupCount--;
                }
            }
        }
    }

    /**
     * This function will fetch all the groups within a configuration object
     * @param {object} - configurations - object to fetch groups for each configuration
     */
    function getGroups(configurations) {
        var configurationGroups = [];
        var depGr = new GlideRecord("sn_vsc_security_configuration_groups");
        depGr.addQuery("grp_setting", configurations.sys_id);
        depGr.query();
        while (depGr.next()) {
            var grpDependencies = getDependencies(depGr);
            configurationGroups.push({
                dependencies: grpDependencies
            });
        }
        return configurationGroups;
    }

    /**
     * This function will fetch all the depenedencies within a group 
     * @param {object} - depGr - dependency group object to fetch dependencies within each group
     */
    function getDependencies(depGr) {
        var dependencies = [];

        var configObj = {
            "vancouver": {
                "safe_db_config_list": ['glide.report.report_view.check_published', 'glide.soap.require_content_type_xml', 'glide.script.allow.ajaxevaluate',
                    'glide.ui.security.codetag.allow_script', 'glide.ui.jelly.js_interpolation.protect_nested_expressions', 'glide.ui.jelly.js_interpolation.protect',
                    'glide.enable.password_policy', 'glide.ui.escape_text', 'com.glide.cs.html.sanitizer.enabled', 'glide.cookies.http_only',
                    'glide.stax.allow_entity_resolution', 'glide.stax.whitelist_enabled', 'glide.sys.log_impersonation'
                ],
                "no_db_override_config_list": [],
                "safe_no_db_override_config_list": []
            }
        };

        // check if the current release is vancouver or higher
        var release_version = gs.getProperty('com.glide.embedded_help.version');
        var release_letter_idx = -1;

        var relevantReleaseLetters = ['v', 'w', 'x', 'y', 'z'];
        if (release_version != null) {
            release_letter_idx = relevantReleaseLetters.indexOf(release_version.charAt(0));
        }

        var depArray = depGr.grp_list.split(",");
        for (i = 0; i < depArray.length; i++) {
            var currentValue = "";
            var dependencyGr = new GlideRecord("sn_vsc_security_check_configurations");
            dependencyGr.addQuery('sys_id', depArray[i]);
            dependencyGr.query();
            if (dependencyGr.next()) {
                var recommendedType = dependencyGr.getValue("config_type");
                currentValue = dependencyGr.config_current_value.toString();
                if (currentValue && recommendedType.includes("toggle")) {
                    currentValue = currentValue === 'true';
                }

                // update the config description and configType only for the properties listed in safedb_config_list, no_db_override_config_list, safe_no_db_override_list
                var configDescription = dependencyGr.getDisplayValue("config_desc");
                var configName = dependencyGr.getDisplayValue("config_name");
                var configType = dependencyGr.getValue("config_type");

                var configSet = [];
                //  check if the config description is already updated as part of latest release. if yes, do not update.
                for (var j = release_letter_idx; j >= 0; j--) {
                    var release_configs = configObj[release_version];
                    var msg = '';
                    if (configSet.indexOf(configName) < 0 && release_configs != null && release_configs != undefined) {
                        if (release_configs['safe_no_db_override_config_list'].indexOf(configName) >= 0) {
                            configType = "non_overridable";
                            msg = gs.getMessage('Please contact ServiceNow Customer Support to modify this property. This property cannot be altered once set to recommended value.');
                        } else if (release_configs['safe_db_config_list'].indexOf(configName) >= 0) {
                            msg = gs.getMessage('This is a safe db override property and cannot be altered once set to recommended value.');
                        } else if (release_configs['no_db_override_config_list'].indexOf(configName) >= 0) {
                            configType = "non_overridable";
                            msg = gs.getMessage('This is a non-overridable property, contact ServiceNow Customer Support to modify this property.');
                        }
                        if (msg != '' && !configDescription.includes(msg)) {
                            configDescription = configDescription + ' ' + msg;
                        }
                        configSet.push(configName);
                    }
                }

                var dependencyObj = {
                    name: configName,
                    config_configure: dependencyGr.getDisplayValue("config_configure"),
                    sys_id: dependencyGr.getDisplayValue("sys_id"),
                    recommendedType: configType,
                    config_current_value: currentValue,
                    config_link: dependencyGr.getDisplayValue("config_link"),
                    config_description: configDescription
                };
                dependencies.push(dependencyObj);
            }

        }
        return dependencies;
    }
})(context, pageParams);
