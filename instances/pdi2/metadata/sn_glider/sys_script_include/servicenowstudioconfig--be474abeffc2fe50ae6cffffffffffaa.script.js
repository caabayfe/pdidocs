class ServicenowStudioConfig {

    /**
     * Determines whether Build Agent should be enabled for the current user/instance.
     * All three conditions below must be true:
     *   1. The current user has the sn_glider.admin role.
     *   2. The Build Agent plugin (com.sn_build_agent) is active on the instance.
     *   3. The Build Agent IDE extension record (sn_glider_ide_extension,
     *      sys_id 86c32528ffa162102810ffffffffffb2) exists and is active.
     *
     * @returns {boolean} true if Build Agent should be enabled, false otherwise.
     */
    static #isBuildAgentEnabled() {
        if (!gs.getUser().hasRole('sn_glider.admin')) {
            return false;
        }
        if (!GlidePluginManager.isActive('com.sn_build_agent')) {
            return false;
        }

        // Look up the Build Agent extension record by its fixed sys_id and confirm it's active.
        var buildAgentExtension = new GlideRecord('sn_glider_ide_extension');
        return buildAgentExtension.get('86c32528ffa162102810ffffffffffb2') &&
            ['true', '1'].includes(buildAgentExtension.getValue('active'));
    }

    /**
     * Public entry point for #isBuildAgentEnabled(), for callers outside this class
     * (e.g. glider-variables.handlebars, to gate rendering Build Agent-only config
     * such as the Foundry/Nirvana URLs) that can't reach a private class field.
     *
     * @returns {boolean} true if Build Agent should be enabled, false otherwise.
     */
    static isBuildAgentEnabled() {
        return ServicenowStudioConfig.#isBuildAgentEnabled();
    }

    /**
     * Determines whether the current instance is a regulated market instance.
     * Regulated instances have restrictions on certain features like Build Agent.
     *
     * @returns {boolean} true if this is a regulated instance, false otherwise.
     */
    static #isRegulatedInstance() {
        var value = gs.getProperty('glide.regulated_instance', 'false');
        return value.toLowerCase() === 'true';
    }

    static snsStudioConfig = {
        "menuItems": [],
        "studioShellLogo": "servicenow-studio.svg",
        "homeRoute": "home",
        "builderRoute": "builder",
        "studioBasePath": "/now/servicenow-studio/",
        "enableThemeVariantSwitcher": true,
        "enableElevateRole": true,
        "maxTabsLimit": 20,
        "studioAppName": "Studio",
        "studioAppNamespace": "servicenow_studio",
        "studioScopeName": "sn_sns",
        "searchConfig": {
            "enableSearch": true,
            "enableCodeSearch": true,
            "searchAppConfig": {
                "zing": "1b1cfcae1b931250f03cedf2604bcbd4"
            }
        },
        "nowAssistConfig": {
            "enableNowAssist": true,
            "additionalContextData": {
                "ux_page_registry_id": "8371ef05c3fb3110c85c213ea540dd94",
                "skillId": "637f2ce0c3240210a586e548fa40ddc7"
            }
        },
        "buildAgentConfig": {
            "enableBuildAgent": ServicenowStudioConfig.#isBuildAgentEnabled(),
            "isRegulatedInstance": ServicenowStudioConfig.#isRegulatedInstance()
        },
        "headerControls": {
            "enableHelp": false
        },
        "appAccessTemplateId": "5b4039a277a3311000381995ba5a99c4",
        "virtualTabGroups": {
            "flow-designer": [
                "sys_hub_flow",
                "sys_app_template",
                "sys_hub_action_type_definition",
                "sys_flow_context"
            ]
        },
        "studioSettings": {
            "useBuildAgent": true
        },
        "handleFileCreation": true,
        "fileNavigatorConfig": {
            "enabled": true,
            "pinningStatus": "full",
            "createMenu": {
                "options": [{
                        "id": "new-app",
                        "label": {
                            "translatable": true,
                            "message": "App"
                        },
                        "icon": "window-outline"
                    },
                    {
                        "id": "new-file",
                        "label": {
                            "translatable": true,
                            "message": "File"
                        },
                        "icon": "document-blank-outline",
                        "roles": ["admin", "sn_udc.admin", "delegated_developer"]
                    }
                ]
            },
            "categories": {
                "apps": {
                    "openList": {
                        "list": {
                            "url": "/now/studio-pages/metadata-list/${table}?sysparm_query=${sysparm_query}"
                        }
                    }
                },
                "files": {
                    "openList": {
                        "list": {
                            "url": "/now/studio-pages/metadata-list/${table}"
                        },
                        "details": {
                            "url": "/now/studio-pages/metadata-list/${table}?sysparm_query=${sysparm_query}&sysparm_fixed_query=${sysparm_fixed_query}"
                        }
                    }
                },
                "recent": {
                    "openList": {
                        "list": {
                            "url": "/now/studio-pages/metadata-list/${table}?sysparm_query=${sysparm_query}"
                        }
                    }
                }
            }
        }
    };

    static #getAgentConfig() {
        var studioConfig = ServicenowStudioConfig.snsStudioConfig;
        var isBuildAgentEnabled = studioConfig?.buildAgentConfig?.enableBuildAgent;
        var studioAppNamespace = studioConfig?.studioAppNamespace;
        var agentConfig = {};
        if (isBuildAgentEnabled) {
            agentConfig = sn_udc.UDCService.getBuildAgentConfig(studioAppNamespace);
        }
        return agentConfig;
    }

    static #getCurrentScopeAndUpdateSet() {
        var studioConfig = ServicenowStudioConfig.snsStudioConfig;
        var sessionScopeAndUpdateSet = {};
        sessionScopeAndUpdateSet = sn_udc.UDCService.getCurrentScopeAndUpdateSet();
        sessionScopeAndUpdateSet.scopeOfLastModifiedUpdateSet = sn_udc.UDCService.getCurrentUpdateSetScopeForUser();
        return sessionScopeAndUpdateSet;
    }

    static #getSearchContextConfigId() {
        var studioConfig = ServicenowStudioConfig.snsStudioConfig;
        var zingSearchContextId = studioConfig.zingSearchContextId || null;
        const aisSearchContextId = studioConfig.aisSearchContextId || null;

        if (!zingSearchContextId || !aisSearchContextId) return '';
        const isAISEnabled = gs.getProperty('glide.ais.enabled', false);
        if (isAISEnabled)
            return aisSearchContextId;

        return zingSearchContextId;
    }

    static #getUserPreferences() {
        var studioConfig = ServicenowStudioConfig.snsStudioConfig;
        var studioAppNamespace = studioConfig.studioAppNamespace;

        if (!studioAppNamespace) {
            return {};
        }

        const user = gs.getUser();
        const userSysId = user.getID();

        const preferences = [{
                name: 'scope.based.tab.grouping.enabled',
                preferenceKey: `${studioAppNamespace}.scope.based.tab.grouping.enabled`,
                defaultValue: null,
            },
            {
                name: 'recentSearches',
                preferenceKey: `${studioAppNamespace}.${userSysId}.recentSearches`,
                defaultValue: [],
                transformPreferenceValue: (key, value) => sn_udc.UDCService.removeOldRecentSearches(key, value)
            },
            {
                name: 'themeVariant',
                preferenceKey: 'glide.ui.udc.theme.variant',
                defaultValue: null,
            },
            {
                name: 'showFileParentCategories',
                preferenceKey: `${studioAppNamespace}.${userSysId}.showFileParentCategories`,
                defaultValue: true
            },
            {
                // Note: This name must match COLLECTIONS_WELCOME_DISMISSED_PREFERENCE in collectionsPane.constants.js
                name: 'collectionsWelcomeDismissed',
                preferenceKey: `${studioAppNamespace}.${userSysId}.collectionsWelcomeDismissed`,
                defaultValue: null
            },
            {
                name: 'snsWelcomeDismissed',
                preferenceKey: `${studioAppNamespace}.${userSysId}.snsWelcomeDismissed`,
                defaultValue: null
            },
            {
                name: 'releaseOpsSelectedApplicationId',
                preferenceKey: `${studioAppNamespace}.${userSysId}.releaseOpsSelectedApplicationId`,
                defaultValue: null
            },
            {
                name: 'releaseOpsSelectedCollectionId',
                preferenceKey: `${studioAppNamespace}.${userSysId}.releaseOpsSelectedCollectionId`,
                defaultValue: null
            }
        ];

        const userPreferences = preferences.reduce((acc, {
            preferenceKey,
            defaultValue,
            transformPreferenceValue
        }) => {
            let preferenceValue = user.getPreference(preferenceKey); // Fetch the preference first

            if (typeof transformPreferenceValue === 'function')
                preferenceValue = transformPreferenceValue(preferenceKey, preferenceValue);

            acc[preferenceKey] = preferenceValue != null ? preferenceValue : defaultValue;
            return acc;
        }, {});

        return userPreferences;
    }

    static #getNAPConfig() {
        return sn_udc.UDCService.getNAPConfig({
            studioConfig: JSON.stringify(ServicenowStudioConfig.snsStudioConfig)
        });
    }

    static #hydrateCache() {
        var studioConfig = ServicenowStudioConfig.snsStudioConfig;
        var isFileNavigatorEnabled = studioConfig?.fileNavigatorConfig?.enabled || false;
        if (isFileNavigatorEnabled) {
            sn_udc.UDCService.cacheAndGetTaxonomyStructure();
        }
    }

    static #getSystemProperties() {
        return {
            searchAccessRoles: gs.getProperty('glide.ui.can_search', '')
        }
    }

    static getSNSConfig() {

        // Hydrate Cache
        ServicenowStudioConfig.#hydrateCache();

        // Return studio config data
        return {
            snsConfigData: ServicenowStudioConfig.snsStudioConfig,
            agentConfig: ServicenowStudioConfig.#getAgentConfig(),
            currentScopeAndUpdateSet: ServicenowStudioConfig.#getCurrentScopeAndUpdateSet(),
            searchContextConfigId: ServicenowStudioConfig.#getSearchContextConfigId(),
            userPreferences: ServicenowStudioConfig.#getUserPreferences(),
            systemProperties: ServicenowStudioConfig.#getSystemProperties(),
            napConfig: ServicenowStudioConfig.#getNAPConfig()
        }
    }
}
