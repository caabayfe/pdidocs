const Screen = Class.create();
Screen.prototype = Object.extendsObject(BuilderToolkitAPIBase, {
    TABLE: 'sys_ux_screen',
    FIELDS: ['name', 'macroponent', 'parent_macroponent', 'macroponent_config', 'event_mappings', 'rollback_screen', 'order', 'screen_type', 'screen_condition', 'sys_policy', 'sys_overrides', 'sys_updated_on', 'sys_updated_by', 'active', 'disable_auto_reflow', 'disable_interoperable','sys_scope', 'sys_package', 'app_config', 'advanced_performance_settings'],
    FIELD_TYPES: {
        name: 'string',
        macroponent: 'reference',
        parent_macroponent: 'reference',
        macroponent_config: 'json',
        event_mappings: 'json',
        rollback_screen: 'string',
        order: 'integer',
        screen_type: 'reference',
        screen_condition: 'string',
        active: 'boolean',
        disable_auto_reflow: 'boolean',
        disable_interoperable: 'boolean',
        advanced_performance_settings: 'json'
    },

    /**
     * @param fields {string[]}
     * @param noDomain {boolean}
     */
    initialize: function(fields, noDomain, includeDisplayValue) {
        BuilderToolkitAPIBase.prototype.initialize.call(this, this.TABLE, fields || this.FIELDS, noDomain, includeDisplayValue);
        this.macroponentHandler = new Macroponent();
    },

    create: function(experience, screenData, macroponent = {}, routeParameters = [], applicabilitiesData, screenTestValuesData = {}, templateId = false, mode = false, aiTemplateOverrides = {}) {
        const experienceHandler = new Experience();
        const mcpHandler = new Macroponent();
        const templateHandler = new UIBTemplate();
        const screenTestValueHandler = new ScreenTestValue();
        const screenApplicabilityHandler = new ScreenApplicability([], this.noDomain);
        let errorMessage = BuilderToolkitConstants.ERRORS.NO_EXPERIENCE_FOUND;
        if (screenData) {
            let experienceData = experience;
            if (typeof experience === 'string') {
                const experienceRecord = experienceHandler.getRecordById(experience);
                const extensionPoint = new ExtensionPoint().getRecordById(experience);
                experienceData = {
                    appConfig: experienceRecord ? experienceRecord?.adminPanel : null,
                    parentMacroponent: screenData?.parentMacroponent ?? extensionPoint?.appShell ?? experienceRecord?.rootMacroponent,
                    extensionPoint: extensionPoint?.sysId ?? null
                };
            }
            let macroponentId = screenData.macroponent ?? false;
            let mcpResult = false;
            let macroponentConfig = false;
            if (templateId && !macroponentId) {
                const templateRecord = templateHandler.getRecordById(templateId);
                if (templateRecord) {
                    mcpResult = mcpHandler.copy(templateRecord.macroponent, null, null, null, aiTemplateOverrides);
                    if (typeof mcpResult === 'string') {
                        return mcpResult;
                    }
                    const templateProperties = [
                        ...(templateRecord.requiredProperties ?? []),
                        ...(templateRecord.optionalProperties ?? [])
                    ];
                    const testValues = templateProperties.reduce(templateHandler.getTestValues, {});
                    screenTestValuesData = screenTestValuesData === {} ? screenTestValuesData : {
                        macroponentConfig: {
                            ...screenTestValuesData.macroponentConfig ?? {},
                            ...testValues
                        }
                    };
                    macroponentConfig = templateRecord.macroponentConfig ?? macroponentConfig;
                } else {
                    return BuilderToolkitConstants.ERRORS.FAILED_TO_FIND_TEMPLATE;
                }
            } else {
                errorMessage = BuilderToolkitConstants.ERRORS.FAILED_TO_CREATE_MACROPONENT;
                mcpResult = macroponentId ? (mode === 'reference' ? macroponentId : mcpHandler.copy(macroponentId, null, null, null, aiTemplateOverrides)) : mcpHandler.createRecord({
                    ...(macroponent ?? {}),
                    name: macroponent?.name ? macroponent.name : screenData.name,
                    ['extends']: BuilderToolkitConstants.PAGE_TEMPLATE_ID,
                    category: experienceData?.extensionPoint ? BuilderToolkitConstants.SUB_PAGE_CATEGORY : BuilderToolkitConstants.PAGE_CATEGORY,
                    extensionPoint: experienceData?.extensionPoint ?? null,
                    props: routeParameters.map(function(routeParam) {
                        return {
                            ...BuilderToolkitConstants.ROUTE_PARAM_PROPERTIES,
                            name: routeParam,
                            label: routeParam,
                        };
                    })
                });
            }

            if (mcpResult && !mcpResult.error) {
                const screenDataObject = {
                    ...screenData,
                    ...experienceData,
                    macroponent: mcpResult.newMacroponentId || mcpResult,
                };

                // We need to add the page template's default prop values into the macroponent config
                const mcpExtends = this.macroponentHandler.getRecordById(BuilderToolkitConstants.PAGE_TEMPLATE_ID);
                if (mcpExtends && mcpExtends.props) {
                    screenDataObject.macroponentConfig = (mcpExtends.props ?? []).reduce((acc, prop) => {
                        if (prop.defaultValue !== undefined) {
                            acc[prop.name] = {
                                type: "JSON_LITERAL",
                                value: prop.defaultValue
                            };
                        }
                        return acc;
                    }, {});
                }
                // If we came from a template, we'll add those in too prefering them over the page template ones
                if (macroponentConfig) {
                    screenDataObject.macroponentConfig = {
                        ...(screenDataObject.macroponentConfig ?? {}),
                        ...(macroponentConfig ?? {})
                    };
                }
                const screenId = this.createRecord(screenDataObject);
                errorMessage = BuilderToolkitConstants.ERRORS.FAILED_TO_CREATE_SCREEN;
                if (screenId) {
                    const newApplicabilities = applicabilitiesData.map(function(applicability) {
                        return {
                            applicability: applicability,
                            screen: screenId
                        };
                    });
                    return {
                        macroponent: mcpResult.newMacroponentId || mcpResult,
                        screen: screenId,
                        screenTestValues: screenTestValueHandler.createRecord({
                            ...screenTestValuesData,
                            screen: screenId,
                        }),
                        applicabilities: screenApplicabilityHandler.createRecords(newApplicabilities)
                    };
                }
            }
            if (mode !== 'reference') {
                this.macroponentHandler.deleteRecord({
                    sysId: mcpResult.newMacroponentId || mcpResult
                });
            }
        }
        return errorMessage;
    },

    /**
     * @param screenSysId {string} the sys_id of the screen we are starting from
     * @param overrideFieldValues {object} an object with new values for the records e.g {name: value}
     * @param scope {string} the sys_id of the scope we should use
     * @param domain {string} the sys_id of the domain we should use
     */
    duplicate: function(screenSysId, overrideFieldValues = {}, scope = null, domain = null) {
        const screen = this.getRecordById(screenSysId, true);
        const screenValues = this.getValuesFromGlideRecord(screen);
        const originalMCPSysId = screen.getValue('macroponent');
        const deleteFunctions = [];

        let errorMessage = BuilderToolkitConstants.NO_SCREEN_FOUND;
        if (!screen) {
            return errorMessage;
        }
        // Early check for circular dependency - stop duplication if found
        // Recursively check all nested levels for circular dependencies
        const originalScreenCollection = screen.getValue('screen_type');
        const hasCircularDependency = this._findCircularDependencies(originalMCPSysId, originalScreenCollection, originalScreenCollection);
        if (hasCircularDependency) {
            return {
                error: true,
                errorType: 'CIRCULAR_DEPENDENCY',
                message: 'Cannot duplicate variant due to circular dependency with subscreens'
            };
        }
        const mcpHandler = new Macroponent();
        const mcpResult = mcpHandler.copy(screen.getValue('macroponent'), scope, domain);
        if (typeof mcpResult === 'string') {
            return mcpResult;
        }
        const {
            newMacroponentId,
            relayEventReplacementMap
        } = mcpResult;

        // We need to replace any relay event mapping names with the new ones now used by the new MCP
        let updatedEventMappings = screenValues.eventMappings ?? [];
        if (Object.keys(relayEventReplacementMap).length > 0) {
            updatedEventMappings = JSON.stringify(updatedEventMappings);
            Object.entries(relayEventReplacementMap).forEach(([oldValue, newValue]) => {
                updatedEventMappings = updatedEventMappings.replaceAll(oldValue, newValue);
            });
            updatedEventMappings = JSON.parse(updatedEventMappings);
        }

        const newScreenId = this.copyRecord(screen, null, {
            ...(overrideFieldValues?.screen ?? {}),
            eventMappings: updatedEventMappings,
            macroponent: newMacroponentId
        });
        deleteFunctions.push({
            handler: new Screen(),
            records: [{
                sysId: newScreenId
            }]
        });
        errorMessage = BuilderToolkitConstants.FAILED_TO_CREATE_SCREEN;
        if (!newScreenId) {
            this.executeDeleteFunctions(deleteFunctions);
            return errorMessage;
        }

        const applicabilityHandler = new ScreenApplicability([], this.noDomain);
        const newApplicabilities = (overrideFieldValues?.applicabilities ?? []).map(function(applicability) {
            return {
                applicability: applicability,
                screen: newScreenId
            };
        });
        const newApplicabilityM2MIds = applicabilityHandler.createRecords(newApplicabilities);
        if (newApplicabilityM2MIds !== true) {

            deleteFunctions.push({
                handler: applicabilityHandler,
                records: newApplicabilityM2MIds.map((item) => ({
                    sysId: item
                }))
            });
            errorMessage = BuilderToolkitConstants.FAILED_TO_CREATE_SCREEN;
            if (newApplicabilityM2MIds.some((result) => result === false)) {
                this.executeDeleteFunctions(deleteFunctions);
                return errorMessage;
            }
        }

        const screenConditionHandler = new ScreenCondition([], this.noDomain);
        const newScreenConditions = screenConditionHandler.copyRecords(null, `screen=${screenSysId}`, {
            screen: newScreenId
        }, scope, domain);
        if (newScreenConditions.length > 0) {
            deleteFunctions.push({
                handler: screenConditionHandler,
                records: newScreenConditions
            });
            errorMessage = BuilderToolkitConstants.FAILED_TO_CREATE_SCREEN;
            if (newScreenConditions.some((result) => result === false)) {
                this.executeDeleteFunctions(deleteFunctions);
                return errorMessage;
            }
        }

        const screenTestValueHandler = new ScreenTestValue();
        let newScreenTestValue = screenTestValueHandler.copyRecord(null, screenSysId, {
            screen: newScreenId
        }, scope, domain);
        if (!newScreenTestValue) {
            newScreenTestValue = screenTestValueHandler.createRecord({
                screen: newScreenId,
                sysScope: scope
            });
        }

        // Check for subroutes and emit event (circular dependency already checked at start)
        const subscreens = this.getRecordsByQuery('parent_macroponent=' + originalMCPSysId, '', true);
        const hasSubscreens = subscreens && subscreens.hasNext();
        
        if (hasSubscreens) {
            gs.eventQueue('sn_uibtk_api.create.subscreen', screen, this.getUserUpdateSetId(), newMacroponentId);
        }
        const route = new AppRoute().getRecordsByQuery(`screen_type=${screen.getValue('screen_type')}`);
        return {
            macroponent: newMacroponentId,
            screen: newScreenId,
            screenTestValue: newScreenTestValue,
            route: route ? route[0].sysId : null,
            hasSubscreens
        };
    },

    /**
     * Recursively finds circular dependencies in subscreens
     * @param macroponentId {string} the sys_id of the macroponent to check children for
     * @param screenCollection {string} screen_type of the screen
     * @param originalScreenCollection {string} the screen_type of the original screen being duplicated
     * @returns {boolean} true if circular dependency found, false otherwise
     */
    _findCircularDependencies: function(macroponentId, screenCollection, originalScreenCollection) {
        // Get all subscreens for this macroponent
        const subscreens = this.getRecordsByQuery('parent_macroponent=' + macroponentId, '', true);
        if (!subscreens || !subscreens.hasNext()) {
            return false;
        }
        
        while (subscreens.next()) {
            const subscreenCollection = subscreens.getValue('screen_type');
            const subscreenMacroponent = subscreens.getValue('macroponent');
            
            // Check if this subscreen has the same screen collection as the original - bail out immediately
            if (subscreenCollection === originalScreenCollection || subscreenCollection === screenCollection) {
                gs.error('Stopping duplication due to circular dependency. Circular dependency screen: { sysId: ' + subscreens.getUniqueValue() + ', name: ' + subscreens.getValue('name') + ', screenCollection: ' + subscreenCollection + ' }', 'Screen.duplicate');
                return true;
            }
            
            // Recursively check children of this subscreen - bail out if found
            if (subscreenMacroponent) {
                if (this._findCircularDependencies(subscreenMacroponent, subscreenCollection, originalScreenCollection)) {
                    return true;
                }
            }
        }
        
        return false;
    },

    /**
     * @param parentMCP {GlideRecord} the parent macroponent record for the screen
     * @param pageRegistry {GlideRecord} the page registry record for the screen
     * @param screen {GlideRecord} the current screen
     */
    getParent: function(parentMCP, pageRegistry, screen) {
        const parentScreen = parentMCP ? this.getRecordsByQuery('macroponent=' + parentMCP.getUniqueValue(), 'name', true) : null;
        const hasParentScreen = parentScreen && parentScreen.next();
        const parentMacroponentValues = parentMCP ? this.macroponentHandler.getValuesFromGlideRecord(parentMCP) : null;

        // get upstream attributes
        let upstreamAttributes = {
            data: []
        };
        // from parent mcp (if there is one)
        if (parentMacroponentValues) {
            upstreamAttributes = this.getUpstreamAttributes(parentMacroponentValues);
        }
        // and from the parent app (if there is one); only merging handledEvents for explicit mapping in X multi-form scenarios
        if (!pageRegistry.parent_app.nil() && !pageRegistry.parent_app.shell_root.nil()) {
            const shellRootMCPGR = pageRegistry.parent_app.shell_root.getRefRecord();
            const shellRootMCPValues = this.macroponentHandler.getValuesFromGlideRecord(shellRootMCPGR);
            const parentAppUpstreamAttributes = shellRootMCPValues ? this.getUpstreamAttributes(shellRootMCPValues) : null;
            if (parentAppUpstreamAttributes) {
                upstreamAttributes = {
                    ...upstreamAttributes,
                    handledEvents: [...(upstreamAttributes.handledEvents ?? []), ...(parentAppUpstreamAttributes?.handledEvents ?? [])]
                };
            }
        }

        const parentInfo = hasParentScreen ? this.getValuesFromGlideRecord(parentScreen) : {};
        const appRoute = new AppRoute().getRecordsByQuery('screen_type=' + screen.getValue('screen_type'));
        const parentRoutes = parentScreen?.screen_type ? new AppRoute().getRecordsByQuery(`screen_type=${parentScreen?.screen_type}`) : null;
        parentInfo.compositionElementId = appRoute ? appRoute[0].parentMacroponentCompositionElementId : null;

        return {
            ...upstreamAttributes,
            appInfo: this.getParentAppInfo(pageRegistry),
            info: parentInfo,
            routes: parentRoutes,
            state: parentMacroponentValues?.stateProperties ?? []
        };
    },

    /**
     * @param pageRegistry {GlideRecord} the page registry record for the screen
     * @param parentMacroponentId {string} the sys_id of the screen's parent macroponent
     */
    getAncestor: function(pageRegistry, parentMacroponentId) {
        const sessionDataBroker = new Macroponent().getRecordById(BuilderToolkitConstants.SESSION_DATABROKER_SYS_ID);
        const hasDifferentAncestor = !pageRegistry.root_macroponent.nil() && pageRegistry.getValue('root_macroponent') !== parentMacroponentId;
        let ancestor = {
            data: []
        };
        if (hasDifferentAncestor && !pageRegistry.root_macroponent.nil()) {
            const appShellMacroponentValues = this.macroponentHandler.getValuesFromGlideRecord(pageRegistry.root_macroponent.getRefRecord());
            ancestor = this.getUpstreamAttributes(appShellMacroponentValues);
        }
        ancestor.data = ancestor.data.concat(sessionDataBroker.data);
        return ancestor;
    },

    /**
     * @param upstreamMCPValues {object} an object with all of the fields from an ancestor macroponent
     */
    getUpstreamAttributes: function(upstreamMCPValues) {
        const upstreamScreen = this.getRecordsByQuery('macroponent=' + upstreamMCPValues.sysId)?.[0];
        const upstreamScreenTestValues = new ScreenTestValue().getRecordsByQuery('screen.macroponent=' + upstreamMCPValues.sysId)?.[0];
        let upstreamValues = {
            data: upstreamMCPValues.data || [],
            elements: this.macroponentHandler.getCompositionElements(upstreamMCPValues.composition),
            handledEvents: upstreamMCPValues?.handledEvents ? [{
                sourceId: upstreamMCPValues?.sysId,
                sourceName: upstreamMCPValues?.name,
                handledEvents: upstreamMCPValues?.handledEvents
            }] : [],
            properties: upstreamMCPValues?.props ?? [],
            propertyValues: {
                testValues: upstreamScreenTestValues ? upstreamScreenTestValues?.macroponentConfig : {},
                values: upstreamScreen ? upstreamScreen.macroponentConfig : {}
            }
        };
        if (upstreamMCPValues['extends']) {
            const nextUpstreamMacroponent = this.macroponentHandler.getRecordById(upstreamMCPValues['extends']);
            const furtherUpstreamValues = this.getUpstreamAttributes(nextUpstreamMacroponent);
            const combinedProperties = upstreamValues?.properties?.concat(furtherUpstreamValues?.properties).reduce((acc, prop) => {
                if (!acc.some(({
                        name
                    }) => name === prop?.name)) {
                    acc.push(prop);
                }
                return acc;
            }, []);
            return {
                data: upstreamValues?.data?.concat(furtherUpstreamValues?.data) ?? [],
                elements: upstreamValues?.elements?.concat(furtherUpstreamValues?.elements) ?? [],
                handledEvents: upstreamValues?.handledEvents?.concat(furtherUpstreamValues?.handledEvents) ?? [],
                properties: combinedProperties,
                propertyValues: {
                    testValues: {
                        ...(upstreamValues?.propertyValues?.testValues ?? {}),
                        ...(furtherUpstreamValues?.propertyValues?.testValues ?? {})
                    },
                    values: {
                        ...(upstreamValues?.propertyValues?.values ?? {}),
                        ...(furtherUpstreamValues?.propertyValues?.values ?? {})
                    }
                }
            };
        }

        return upstreamValues;
    },

    /**
     * @param pageRegistry {GlideRecord} the page registry record for the screen
     */
    getParentAppInfo: function(pageRegistry) {
        if (!pageRegistry.isValidRecord()) {
            return {};
        }
        const pageRegistryRootMCP = pageRegistry.getValue('root_macroponent');
        let parentApp = pageRegistry.parent_app.getRefRecord();
        if (!parentApp.isValidRecord() &&
            (pageRegistryRootMCP === 'c276387cc331101080d6d3658940ddd2' // agent workspace shell id
                ||
                pageRegistryRootMCP === 'e341e22cc32e2010ea04a5a1d840dd02')) { // breadcrumb shell id
            parentApp = this.get('sys_ux_app', 'sys_id=c86a62e2c7022010099a308dc7c26022');
            if (parentApp.next()) {
                parentApp = null;
            }
        }
        if (parentApp !== null) {
            return {
                appId: parentApp ? parentApp.getUniqueValue() : null,
                appName: parentApp.getValue('name'),
                themeId: parentApp.getValue('theme'),
                isPolaris: parentApp.getUniqueValue() === 'c86a62e2c7022010099a308dc7c26022'
            };
        }
        return null;
    },

    /**
     * @param parentMacroponentSysId {string} the sys_id of the screen's parent macroponent
     */
    getSubroutes: function(parentMacroponentSysId) {
        const appRoutes = new AppRoute().getRecordsByQuery('parent_macroponent=' + parentMacroponentSysId, 'name');
        const subroutes = [];
        appRoutes.forEach((appRoute) => {
            const subscreens = [];
            const subscreenValues = this.getRecordsByQuery('screen_type=' + appRoute.screenType, 'name');
            subscreenValues.forEach((screen) => {
                subscreens.push({
                    additionalConditions: [],
                    condition: screen.screenCondition,
                    eventMappings: screen.eventMappings,
                    id: screen.sysId,
                    macroponentConfiguration: screen.macroponentConfig,
                    macroponentSysId: screen.macroponent,
                    name: screen.name,
                    order: screen.order,
                    screenType: screen.screenType,
                    sysPolicy: screen.sysPolicy,
                });
            });
            subroutes.push({
                ...appRoute,
                controllerDependencyMap: null,
                controllerElementId: null,
                id: appRoute.sysId,
                parentCompositionElementId: appRoute.parentMacroponentCompositionElementId,
                macroponents: subscreens,
            });
        });
        return subroutes;
    },

    getSubrouteByElementID: function(screenId, elementId) {
        const screenGR = this.getRecordById(screenId);
        const routeHandler = new AppRoute(false, this.noDomain, this.includeDisplayValue);
        const macroponentHandler = new Macroponent(false, this.noDomain, this.includeDisplayValue);
        const screenCollectionHandler = new ScreenCollection(false, this.noDomain, this.includeDisplayValue);
        if (screenGR) {
            const macroponentId = this.includeDisplayValue ? screenGR.macroponent.value : screenGR.macroponent;
            const screenTypeId = this.includeDisplayValue ? screenGR.screenType.value : screenGR.screenType;
            const routes = routeHandler.getRoutes(`parent_macroponent=${macroponentId}^parent_macroponent_composition_element_id=${elementId}`);
            const macroponent = macroponentHandler.getRecordById(macroponentId);
            const screenCollection = screenCollectionHandler.getRoutes(screenTypeId);
            return {
                ...screenGR,
                routes,
                macroponent,
                screenCollection
            };
        }
        return {};
    },

    /**
     * @param extensionPointSysId {string} the sys_id of the extension point we are starting from
     */
    getExperiencesForExtensionPoint: function(extensionPointSysId) {
        let experiences = [];
        const screenGR = this.getRecordsByQuery(`active=true^macroponent.compositionLIKE${extensionPointSysId}`, 'name', true);
        const experienceHandler = new Experience(['title']);
        if (!screenGR) {
            return experiences;
        }

        while (screenGR.next()) {
            const appConfig = screenGR.getValue('app_config');
            const experienceGR = experienceHandler.getRecordsByQuery(`active=true^admin_panel=${appConfig}`, 'title', true);
            while (experienceGR.next()) {
                const title = experienceGR.getValue('title');
                const sysId = experienceGR.getValue('sys_id');
                const foundIndex = experiences.findIndex((expValue) => {
                    return (expValue.experience === title && expValue.sysId === sysId);
                });

                if (foundIndex < 0) {
                    experiences.push({
                        experience: title,
                        sysId: sysId
                    });
                }
            }
        }

        return experiences;
    },

    /**
     * Gets all of the override screens for a provided screen
     * @param screenSysId {string} the sysId of the screen we are getting overrides for
     */
    getScreenOverrides: function(screenSysId) {
        const screenGR = this.getRecordById(screenSysId, true);
        if (!screenGR || !screenGR.getValue('sys_overrides')) {
            return [];
        }
        const screenOverrides = [{
            sysId: screenGR.getUniqueValue(),
            name: screenGR.name.getDisplayValue(),
            domainName: screenGR.sys_domain.getDisplayValue(),
            sysOverride: screenGR.getValue('sys_overrides')
        }];

        let screenOverrideSysId = screenGR.getValue('sys_overrides');
        while (screenOverrideSysId !== null) {
            const overrideScreenGR = this.getRecordById(screenOverrideSysId, true);
            if (!overrideScreenGR) {
                break;
            }
            screenOverrideSysId = overrideScreenGR.getValue('sys_overrides');
            screenOverrides.push({
                sysId: overrideScreenGR.getUniqueValue(),
                name: overrideScreenGR.name.getDisplayValue(),
                domainName: overrideScreenGR.sys_domain.getDisplayValue(),
                sysOverride: screenOverrideSysId
            });
        }

        return screenOverrides;
    },
    /**
     * Gets the screen, screenTestValues, contextState, and event definitions
     * @param sysId {string} the sys_id of the screen we are fetching
     */
    getScreenAndRelatedRecords: function(sysId) {
        const screenGR = this.getRecordById(sysId, true);
        const screen = this.getValuesFromGlideRecord(screenGR);
        const screenTestValues = new ScreenTestValue().getRecordById(sysId);
        const screenAttrs = new ScreenAttrs().getRecordByScreenId(sysId);
        const macroponentGR = screenGR.macroponent.getRefRecord();
        const pageHandler = new Page();
         
     

        const routeGR = new AppRoute().getRecordsByQuery('extension_point!=^screen_type=' + screenGR.getValue('screen_type'), 'name', true);
        let contextState = routeGR && routeGR.next() ? pageHandler.getContextState(screenGR, macroponentGR, routeGR.extension_point.getRefRecord()) : pageHandler.getContextState(screenGR, macroponentGR);

        const parentHandledEventIds = contextState?.parent?.handledEvents?.reduce((acc, handler) => {
            return acc.concat(handler?.handledEvents);
        }, []);
        const ancestorHandledEventIds = contextState?.ancestor?.handledEvents?.reduce((acc, handler) => {
            return acc.concat(handler?.handledEvents);
        }, []);
        // Get all events for our MCP, dbs, components, controllers, parent mcp, and ancestor mcps, and public ones
        const allUxEventIds = `
				${(parentHandledEventIds ?? '')},
                ${(ancestorHandledEventIds ?? '')},
				${(contextState?.extendsMacroponent?.handledEvents ?? '')},
				${BuilderToolkitConstants.PUBLIC_MCP_EVENT_SYS_IDS}
            `.replace(/\s/g, '');

        // We need to query by the eventIds we got
        const eventDefinitions = new UXEvent().getRecordsByQuery(`sys_idIN${allUxEventIds}`, 'name');

        // Fetch appshell rootElementMetaData and pass in contextState.
        const grParent = new GlideRecord('sys_ux_macroponent');
		grParent.get(screen?.parentMacroponent);
		const rootElementMetaData = JSON.parse(grParent.getValue('root_component_definition'));
        contextState = {
        ...contextState, 
        appShell: {
            rootElementMetaData
        }
        };

        return {
            screen,
            screenAttrs,
            screenTestValues,
            contextState,
            eventDefinitions
        };
    },

    type: 'Screen'
});
