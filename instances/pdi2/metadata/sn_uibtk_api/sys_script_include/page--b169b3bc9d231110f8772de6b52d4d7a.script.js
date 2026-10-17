const Page = Class.create();
Page.prototype = {
    initialize: function(noDomain) {
        this.appRouteHander = new AppRoute();
        this.addonEventMappingHandler = new UXAddOnEventMapping([], noDomain);
        this.clientScriptHandler = new ClientScript();
        this.componentDefinitionHandler = new ComponentDefinitions();
        this.controllerHandler = new Controller();
        this.dataBrokerDefinitionHandler = new DataBrokerDefinitions();
        this.experienceHandler = new Experience();
        this.macroponentHandler = new Macroponent();
        this.presetHandler = new ComponentPreset();
        this.controllerPresetHandler = new ControllerPreset();
        this.screenApplicabilityHandler = new ScreenApplicability([], noDomain);
        this.screenCollectionHandler = new ScreenCollection();
        this.screenHandler = new Screen([], noDomain);
        this.screenTestValueHandler = new ScreenTestValue();
        this.uxEventHandler = new UXEvent();
        this.uibTemplateHandler = new UIBTemplate();
        this.extensionPointHandler = new ExtensionPoint();
        this.libComponentHandler = new LibComponent();
    },

    createPage: function(
        experienceId = false,
        screen = false,
        route = false,
        macroponent = {},
        applicabilities = [],
        screenTestValues = {},
        templateId = false,
        mode = false,
        aiTemplateOverrides = {},
    ) {
        let errorMessage = BuilderToolkitConstants.ERRORS.NO_EXPERIENCE_FOUND;
        if (screen && route) {
            const extensionPoint = this.extensionPointHandler.getRecordById(experienceId);
            const experience = this.experienceHandler.getRecordById(experienceId);

            const {
                name: routeName
            } = route;
            const experienceData = {
                appConfig: experience ? experience?.adminPanel : null,
                parentMacroponent: extensionPoint?.appShell ?? route?.parentMacroponent ?? experience?.rootMacroponent,
                extensionPoint: extensionPoint ? extensionPoint?.sysId : null
            };
            const screenCollectionId = this.screenCollectionHandler.createRecord({
                name: routeName
            });
            errorMessage = BuilderToolkitConstants.ERRORS.FAILED_TO_CREATE_SCREEN_COLLECTION;
            if (screenCollectionId) {
                const routeId = this.appRouteHander.createRecord({
                    ...route,
                    ...experienceData,
                    screenType: screenCollectionId,
                });
                errorMessage = BuilderToolkitConstants.ERRORS.FAILED_TO_CREATE_APPROUTE;
                if (routeId) {
                    if (route?.searchFacets) {
                        new SearchFacetItemMappings().createSearchFacetM2Ms(routeId, 'sys_ux_app_route', route.searchFacets);
                    }  
                    const screenResult = this.screenHandler.create(experienceData, {
                        ...screen,
                        screenType: screenCollectionId
                    }, macroponent, [...(route.fields ?? []), ...(route.optionalParameters ?? [])], applicabilities, screenTestValues, templateId, mode, aiTemplateOverrides);
                    if (typeof screenResult !== 'string') {
                        return {
                            ...screenResult,
                            route: routeId,
                            screenCollection: screenCollectionId,
                        };
                    } else {
                        errorMessage = screenResult;
                    }
                    this.appRouteHander.deleteRecord({
                        sysId: routeId
                    });
                }
                this.screenCollectionHandler.deleteRecord({
                    sysId: screenCollectionId
                });
            }
        }
        return errorMessage;
    },

    createSubPage: function(screenGR, overrideFieldValues, scope, domain) {
        // Check for subscreens and see if we have them, if we don't bail
        const screenGlideAggregate = new GlideAggregate('sys_ux_screen');
        screenGlideAggregate.addQuery(`parent_macroponent=${screenGR.getValue('macroponent')}`);
        screenGlideAggregate.groupBy('screen_type');
        screenGlideAggregate.query();
        // Loop through our subscreens and grab their screen collection sys_ids so that we can group them
        const screenCollections = [];
        while (screenGlideAggregate.next()) {
            if (!screenCollections.includes(screenGlideAggregate.screen_type.toString())) {
                screenCollections.push(screenGlideAggregate.screen_type.toString());
            }
        }

        // Create new screen collections based on what we find and make a map of old ID to new ID
        const screenCollectionMapToNewId = {};
        screenCollections.forEach(screenCollectionId => {
            screenCollectionMapToNewId[screenCollectionId] = this.screenCollectionHandler.copyRecord(null, screenCollectionId);
        });

        // Copy over any app routes tied to those screen collections AND to the original parent macroponent
        const existingAppRoute = this.appRouteHander.getRecordsByQuery(`screen_type.sys_idIN${screenCollections.join(',')}^parent_macroponent=${screenGR.getValue('macroponent')}`, '', true);
        if (existingAppRoute) {
            while (existingAppRoute.next()) {
                this.appRouteHander.copyRecord(existingAppRoute, null, {
                    ...overrideFieldValues,
                    screenType: screenCollectionMapToNewId[existingAppRoute.getValue('screen_type')],
                    sysScope: scope,
                    sysDomain: domain
                });
            }
        }

        // Fetch our screens again
        const subscreens = this.screenHandler.getRecordsByQuery(`screen_type.sys_idIN${screenCollections.join(',')}^screen_type!=`, '', true);
        if (subscreens) {
            while (subscreens.next()) {
                this.screenHandler.duplicate(subscreens.getUniqueValue(), {
                    screen: {
                        ...overrideFieldValues,
                        screenType: screenCollectionMapToNewId[subscreens.getValue('screen_type')]
                    }
                }, scope, domain);
            }
        }
    },

    /**
     * @param screenGR {GlideRecord} the screen record we are pulling from
     * @param extensionPointGR {GlideRecord | null} the extension point record our route is are tied to
     */
    getContextState: function(screenGR, macroponentGR, extensionPointGR) {
        const pageRegistry = new BuilderToolkitAPIBase('sys_ux_page_registry').getRecordsByQuery(`admin_panel=${screenGR.getValue('app_config')}`, '', true);
        const {
            embeddedExtensionPointControllers,
            extensionPointController
        } = new Controller().getExtensionPointControllers(extensionPointGR);
        const extensionPointValues = extensionPointGR ? this.extensionPointHandler.getValuesFromGlideRecord(extensionPointGR) : {};
        if (pageRegistry && pageRegistry.next()) {
            const parentMacroponent = !screenGR.parent_macroponent.nil() ? screenGR.parent_macroponent.getRefRecord() : null;
            const parent = extensionPointGR ? this.getParentForExtensionPoint(extensionPointGR.getValue('app_shell')) : this.screenHandler.getParent(parentMacroponent, pageRegistry, screenGR);
            const ancestor = extensionPointGR ? {} : this.screenHandler.getAncestor(pageRegistry, parentMacroponent?.getUniqueValue() ?? null);
            const appPageProperties = [{
                "name": "appId",
                "value": pageRegistry.sys_id
            }].concat(new BuilderToolkitAPIBase('sys_ux_page_property', ['name', 'type', 'route', 'value']).getRecordsByQuery('page=' + pageRegistry.getUniqueValue()));
            let theme = '{}';
            // Adding try catch to protect us from any scriptable changes which are in global
            try {
                theme = UIBScriptables.getThemeForUIB(pageRegistry.getValue('admin_panel'), pageRegistry.getValue('parent_app'));
            } catch (err) {
                // No theme information is set for the page or parent app
            }

            return {
                ancestor,
                extensionPoint: extensionPointValues,
                embeddedExtensionPointControllers: embeddedExtensionPointControllers ?? [],
                extensionPointController,
                extendsMacroponent: this.macroponentHandler.getRecordById(macroponentGR.getValue('extends')),
                appPageProperties,
                parent,
                theme
            };
        }
        return {
            parent: extensionPointGR ? this.getParentForExtensionPoint(extensionPointGR.getValue('app_shell')) : {},
            extensionPoint: extensionPointValues,
            embeddedExtensionPointControllers: embeddedExtensionPointControllers ?? [],
            extensionPointController,
            extendsMacroponent: this.macroponentHandler.getRecordById(macroponentGR.getValue('extends'))
        };
    },

    /**
     * This is the full Page getter function when loading a UIB page
     * 
     * @param screenSysId {string} the sys_id of the screen we are getting
     */
    getUIBEditorPageObject: function(screenSysId) {
        const screenGR = this.screenHandler.getRecordById(screenSysId, true);
        if (screenGR) {
            if (screenGR.macroponent.nil()) {
                return gs.getMessage('No page definition has been found');
            }
            const macroponentGR = screenGR.macroponent.getRefRecord();
            if (!macroponentGR.isValidRecord()) {
                return gs.getMessage('No macroponent definition could be found');
            }
            const screen = this.screenHandler.getValuesFromGlideRecord(screenGR);

            // If we have no parent macroponent we're either broken or in extension point mode
            let contextState = null;
            let extensionPointControllerDefinitionIds = [];
            const routeGR = this.appRouteHander.getRecordsByQuery('extension_point!=^screen_type=' + screenGR.getValue('screen_type'), 'name', true);
            if (routeGR && routeGR.next()) {
                contextState = this.getContextState(screenGR, macroponentGR, routeGR.extension_point.getRefRecord());
                extensionPointControllerDefinitionIds = contextState.embeddedExtensionPointControllers.map(({
                    sysId
                }) => sysId);
            } else {
                contextState = this.getContextState(screenGR, macroponentGR);
            }

            const {
                macroponent,
                dataBrokerDefinitions,
                componentDefinitions,
                clientScripts,
                controllerDefinitions,
                controllerPresetDefinitions,
                presetDefinitions,
                macroponentPublicHandledEvents,
                addOnEventMappings,
                eventDefinitions,
                embeddedMacroponentDefinitions
            } = this.macroponentHandler.getMacroponentAndRelatedRecords(macroponentGR, contextState, extensionPointControllerDefinitionIds);

            const lastUpgradeGR = new GlideRecord('sys_upgrade_history');
            lastUpgradeGR.orderByDesc('upgrade_started');
            lastUpgradeGR.setLimit(1);
            lastUpgradeGR.query();
            const lastUpgradeDT = lastUpgradeGR.next() ? new GlideDateTime(lastUpgradeGR.getValue('upgrade_started')) : null;
            const lastUpgrade = lastUpgradeDT ? lastUpgradeDT.getNumericValue() : null;
            return {
                screen,
                macroponent,
                dataBrokerDefinitions,
                componentDefinitions,
                screenTestValues: this.screenTestValueHandler.getRecordById(screenGR.getUniqueValue()),
                clientScripts,
                controllerDefinitions,
                controllerPresetDefinitions,
                presetDefinitions,
                macroponentPublicHandledEvents,
                contextState,
                subroutes: this.screenHandler.getSubroutes(macroponentGR.getUniqueValue()),
                addOnEventMappings,
                eventDefinitions,
                embeddedMacroponentDefinitions,
                lastUpgrade
            };
        }
        return false;
    },

    /**
     * @param pageRegistry {GlideRecord} the page registry record for the screen
     */
    getParentForExtensionPoint: function(appShellSysId) {
        const appShellGR = this.macroponentHandler.getRecordsByQuery(`sys_id=${appShellSysId}`, '');
        if (appShellGR) {
            return this.screenHandler.getUpstreamAttributes(appShellGR[0]);
        }
        return {};
    },

    /**
     * @param screenCollectionId {string} the sys_id of the page we are duplicating
     * @param screen {object} camelCase name and value pairs to override values on the new screen, name is required at a minimum
     * @param route {object} camelCase name and value pairs to override values on the new route and screen collection, name and routeType are required at a minimum
     */
    duplicate: function(
        screenCollectionId = false,
        screen = {},
        route = {}
    ) {
        let errorMessage = BuilderToolkitConstants.ERRORS.NO_PAGE_FOUND;
        if (screenCollectionId && screen && route && route.routeType) {
            const newScreenCollectionId = this.screenCollectionHandler.copyRecord(null, screenCollectionId, {
                name: route.name
            });
            errorMessage = BuilderToolkitConstants.ERRORS.FAILED_TO_CREATE_SCREEN_COLLECTION;
            if (newScreenCollectionId) {
                const routeIds = this.appRouteHander.copyRecords(null, `screen_type=${screenCollectionId}`, {
                    ...route,
                    screenType: newScreenCollectionId
                });
                errorMessage = BuilderToolkitConstants.ERRORS.FAILED_TO_CREATE_APPROUTE;
                if (routeIds.length > 0) {
                    const relatedScreens = this.screenHandler.getRecordsByQuery(`screen_type=${screenCollectionId}`, 'name', true);
                    let screenSysIds = [];
                    let failedToCreateScreens = false;
                    if (relatedScreens) {
                        while (relatedScreens.next()) {
                            const screenResult = this.screenHandler.duplicate(relatedScreens.getUniqueValue(), {
                                screen: {
                                    ...screen,
                                    screenType: newScreenCollectionId
                                }
                            });
                            if (typeof screenResult === 'string') {
                                failedToCreateScreens = true;
                                break;
                            }
                            screenSysIds.push(screenResult.screen);
                        }
                    }

                    if (failedToCreateScreens === false) {
                        return {
                            screens: screenSysIds.join(','),
                            routes: routeIds.join(','),
                            screenCollection: newScreenCollectionId,
                        };
                    } else {
                        errorMessage = BuilderToolkitConstants.ERRORS.FAILED_TO_CREATE_SCREEN;
                    }

                    // Clean up created screens
                    for (const screenId in screenSysIds) {
                        this.screenHandler.deleteRecord({
                            sysId: screenId
                        });
                    }

                    // Clean up created routes
                    for (const routeId in routeIds) {
                        this.appRouteHander.deleteRecord({
                            sysId: routeId
                        });
                    }
                }
                this.screenCollectionHandler.deleteRecord({
                    sysId: newScreenCollectionId
                });
            }
        }
        return errorMessage;
    },

    type: 'Page'
};
