const apiModules = require('@devsnc/uibtk-api');

const Macroponent = Class.create();
Macroponent.prototype = Object.extendsObject(BuilderToolkitAPIBase, {
    TABLE: 'sys_ux_macroponent',
    FIELDS: ["extends", "bundles", "composition", "data", "layout", "props", "handled_events", "dispatched_events", "internal_event_mappings", "root_component", "root_component_config", "root_component_definition", "associated_types", "category", "state_properties", "required_translations", "output_prop_mapping", "ext_controller_dep", "description", "extension_point", "name", "sys_policy", "sys_scope", "sys_package", "form_factors", "disable_auto_reflow", "style_config"],

    FIELD_TYPES: {
        "extends": 'reference',
        bundles: 'json',
        composition: 'json',
        data: 'json',
        layout: 'json',
        props: 'json',
        handled_events: 'glide_list',
        dispatched_events: 'glide_list',
        internal_event_mappings: 'json',
        root_component: 'reference',
        root_component_config: 'json',
        root_component_definition: 'string',
        associated_types: 'glide_list',
        category: 'string',
        state_properties: 'json',
        required_translations: 'json',
        output_prop_mapping: 'json',
        ext_controller_dep: "json",
        description: 'string',
        extension_point: 'reference',
        name: 'string',
        form_factors: 'json',
        disable_auto_reflow: 'boolean',
		style_config: 'json'
    },

    /**
     * @param fields {string[]}
     */
    initialize: function(fields, noDomain, includeDisplayValue) {
        BuilderToolkitAPIBase.prototype.initialize.call(this, this.TABLE, fields || this.FIELDS, noDomain, includeDisplayValue, this.FIELD_TYPES);
    },

    /**
     * Overrides parent class function to inject special fields
     * @param acc {object} the accumulator object
     * @param field {GlideElement} the field element we are currently working on
     */
    getFieldValues: function(acc, field) {
        acc = BuilderToolkitAPIBase.prototype.getFieldValues.call(this, acc, field);
        if (field.nil()) {
            return acc;
        }
        const fieldName = field.getName();
        if (fieldName === 'root_component_config') {
            acc['rootComponentConfig'] = this.parseJSON(field, {
                field: 'root_component_config',
                sysId: acc.sysId
            });
        } else if (fieldName === 'root_component_definition') {
            acc['rootComponentDefinition'] = this.parseJSON(field, {
                field: 'root_component_definition',
                sysId: acc.sysId
            });
        }
        return acc;
    },

    /**
     * @param macroponentGR {GlideRecord} the record we are getting composition from
     */
    getCompositionMacroponentDefinitions: function(macroponentGR) {
        const composition = this.parseJSON(macroponentGR.composition, {
            field: 'composition',
            sysId: macroponentGR.sysId || macroponentGR.getUniqueValue()
        });
        if (composition && Array.isArray(composition)) {
            return this.getRecordsByQuery('sys_idIN' + macroponentGR.extends + ',' + this.getCompositionMacroponentIds(composition).join(','));
        }
    },

    /**
     * @param composition {UxElement[]} an array of elements
     */
    getCompositionMacroponentIds: function(composition) {
        const that = this;
        if (Array.isArray(composition)) {
            return composition.reduce(function(acc, element) {
                acc.push(element.definition.id);
                if (element?.overrides && element.overrides?.composition && element.overrides.composition.length > 0) {
                    return acc.concat(that.getCompositionMacroponentIds(element.overrides.composition));
                } else if (element?.conditionals && element.conditionals.length > 0) {
                    const conditionalItems = element.conditionals.map((conditional) => conditional?.item ?? {});
                    return acc.concat(that.getCompositionMacroponentIds(conditionalItems));
                }
                return acc;
            }, []);
        }
    },

    /**
     * @param composition {UxElement[]} an array of elements
     */
    getCompositionReferenceIds: function(composition) {
        if (Array.isArray(composition)) {
            return composition.reduce(function(acc, element) {
                acc.mcpIds.push(element.definition.id);
                element.preset ? acc.presetIds.push(element.preset.id) : null;
                if (element.overrides && element.overrides.composition && element.overrides.composition.length > 0) {
                    const overrideValues = this.getCompositionReferenceIds(element.overrides.composition);
                    return {
                        mcpIds: acc.mcpIds.concat(overrideValues.mcpIds),
                        presetIds: acc.presetIds.concat(overrideValues.presetIds)
                    };
                } else if (element?.conditionals && element.conditionals.length > 0) {
                    const conditionalItems = element.conditionals.map((conditional) => conditional?.item ?? {});
                    const overrideValues = this.getCompositionReferenceIds(conditionalItems);
                    return {
                        mcpIds: acc.mcpIds.concat(overrideValues.mcpIds),
                        presetIds: acc.presetIds.concat(overrideValues.presetIds)
                    };
                }
                return acc;
            }.bind(this), {
                mcpIds: [],
                presetIds: []
            });
        }
        return {
            mcpIds: [],
            presetIds: []
        };
    },

    /**
     * @param composition {UxElement[]} an array of elements
     */
    getCompositionElements: function(composition) {
        const that = this;
        if (Array.isArray(composition)) {
            return composition.reduce(function(acc, element) {
                acc.push({
                    propertyValues: element.propertyValues || {},
                    elementLabel: element.elementLabel,
                    elementId: element.elementId,
                    macroponentType: null // See if this is actually needed, it's expensive
                });
                if (element.overrides && element.overrides.length > 0) {
                    return acc.concat(that.getCompositionElements(element.overrides));
                } else if (element?.conditionals && element.conditionals.length > 0) {
                    const conditionalItems = element.conditionals.map((conditional) => conditional?.item ?? {});
                    return acc.concat(that.getCompositionElements(conditionalItems));
                }
                return acc;
            }, []);
        }
    },

    getMacroponentRoutes: function(sysId) {
        const componentGR = this.getRecordById(sysId);

        if (componentGR) {
            const componentId = this.includeDisplayValue ? componentGR.sysId.value : componentGR.sysId;
            const routeHandler = new AppRoute(false, this.noDomain, this.includeDisplayValue);
            const routes = routeHandler.getRoutes(`parent_macroponent=${componentId}`);
            const upgradeStateSysIds = this.getUpgradeStateSysIds(this.TABLE, componentId, routes);

            return {
                ...componentGR,
                routes,
                upgradeStateSysIds
            };
        }
        return {};
    },

    /**
     * @param macroponentGR {GlideRecord} the record we are getting values from
     */
    getHierarchyValues: function(macroponentGR) {
        const {
            data,
            props,
            handledEvents,
            dispatchedEvents,
            rootComponentTag
        } = this.recurseThroughMCPExtends(macroponentGR);
        return {
            data,
            props,
            handledEvents: handledEvents.length > 0 ? handledEvents.join(',') : null,
            dispatchedEvents: dispatchedEvents.length > 0 ? dispatchedEvents.join(',') : null,
            rootComponentTag
        };
    },

    /**
     * @param macroponentGR {GlideRecord} the record we are getting values from
     * @param data {array} an array of data resource objects
     * @param props {array} an array of property objects
     * @param handledEvents {array} an array of event sys_ids
     * @param dispatchedEvents {array} an array of event sys_ids
     * @param rootComponentTag {string} the component tag for the macroponent
     */
    recurseThroughMCPExtends: function(macroponentGR, data = [], props = [], handledEvents = [], dispatchedEvents = [], rootComponentTag = null) {
        const macroponentHandler = new Macroponent(["props", "handled_events", "dispatched_events", "extends", "root_component"]);
        const macroponentValues = macroponentHandler.getValuesFromGlideRecord(macroponentGR);
        if (!macroponentGR['extends'].nil()) {
            const parent = macroponentGR['extends'].getRefRecord();
            const parentValues = this.recurseThroughMCPExtends(parent, props, handledEvents, dispatchedEvents);
            return {
                data: data.concat(macroponentValues.data ?? [], parentValues?.data ?? []),
                props: props.concat(macroponentValues.props ?? [], parentValues.props),
                handledEvents: handledEvents.concat(macroponentValues?.handledEvents?.split(',') ?? [], parentValues.handledEvents),
                dispatchedEvents: dispatchedEvents.concat(macroponentValues?.dispatchedEvents?.split(',') ?? [], parentValues.dispatchedEvents),
                rootComponentTag: macroponentValues.rootComponentTag ? macroponentValues.rootComponentTag : rootComponentTag
            };
        }
        return {
            data: data.concat(macroponentValues.data ?? []),
            props: props.concat(macroponentValues.props ?? []),
            handledEvents: handledEvents.concat(macroponentValues?.handledEvents?.split(',') ?? []),
            dispatchedEvents: dispatchedEvents.concat(macroponentValues?.dispatchedEvents?.split(',') ?? []),
            rootComponentTag: macroponentValues.rootComponentTag ? macroponentValues.rootComponentTag : rootComponentTag
        };
    },

    /**
     * @param macroponentValueObjectArray {array} an array of macroponent definitions {type, sysId}
     */
    convertMacroponentDefinitions: function(macroponentValueObjectArray) {
        return macroponentValueObjectArray.reduce(function(acc, def) {
            acc[def.sysId] = def;
            return acc;
        }, {});
    },

    /**
     * @param {GlideRecord} macroponent - the macroponent we are copying
     * @param {string|null} scope - the scope to create the record in
     * @param {string|null} domain - the domain to create the record in
     * @param {{}|null} overrideValues - the values to set on the macroponent after copying
     * @param {{}|null} aiTemplateOverrides - macroponent update instructions for Text to Experience
     */
    copy: function(macroponent, scope, domain, overrideValues, aiTemplateOverrides = {}) {
        let errorMessage = BuilderToolkitConstants.FAILED_TO_CREATE_MACROPONENT;
        const clientScriptHandler = new ClientScript();
        const eventHandler = new UXEvent();
        const addOnEventHandler = new UXAddOnEventMapping();
        const appRouteHandler = new AppRoute();
        const screenHandler = new Screen();
        const deleteFunctions = [];
        const macroponentId = typeof macroponent === 'string' ? macroponent : macroponent.getUniqueValue();
        const newMacroponentId = this.copyRecord(null, macroponentId, {}, scope, domain);
        let updatedMacroponent = this.getRecordById(newMacroponentId);
        deleteFunctions.push({
            handler: new Macroponent(),
            records: [{
                sysId: newMacroponentId
            }]
        });
        if (!newMacroponentId) {
            this.executeDeleteFunctions(deleteFunctions);
            return errorMessage;
        }
        // If we have override values, spread them into our updated macroponent after we've copied
        // If we are actually changing something, we need to remember to update the server later
        let needsRecordUpdate = Object.keys((overrideValues ?? {})).length > 0 || Object.keys((aiTemplateOverrides ?? {})).length > 0;
        updatedMacroponent = {
            ...updatedMacroponent,
            ...(overrideValues ?? {})
        };

        /*
         * As part of the Text to Experience feature, we need to make modifications to the page, based
         * on what the user has selected during the conversation flows. This code, following a data
         * object constructed from `Text2ExperienceGeneration` and `Text2ExperienceData` script include
         * code, navigates into the page macroponent and changes certain items, like label names, table
         * names, and even entire Data Visualization components.
         * 
         * This code has no impact on pages that weren't created through Text to Experience.
         */
        for (const [key, value] of Object.entries(aiTemplateOverrides ?? {})) {
            try {
                // drill into the relevant part of the macroponent
                let mcpPart = updatedMacroponent;
                const pathParts = key.split(".");
                for (let i = 0; i < pathParts.length - 1; i++) {
                    const pathPart = pathParts[i];
                    if (/^\d+$/.test(pathPart)) {
                        // array index
                        mcpPart = mcpPart[parseInt(pathPart)];
                    } else {
                        // object index
                        mcpPart = mcpPart[pathPart];
                    }
                }
                // now that we're drilled down to just above the value, set it
                mcpPart[pathParts[pathParts.length - 1]] = value;
            } catch (err) {
                gs.error(`T2E error editing macroponent at "${key}": ${err}`);
            }
        }

        // First we have to create our new client scripts
        const newClientScripts = clientScriptHandler.copyRecords(null, `macroponent=${macroponentId}`, {
            macroponent: newMacroponentId
        }, scope, domain);
        // If we created any we need to update our MCP with the new IDs, and prep to delete it all if something fails
        if (newClientScripts.length !== 0) {
            // Set up our deletion for them just in case
            deleteFunctions.push({
                handler: clientScriptHandler,
                records: newClientScripts
            });
            errorMessage = BuilderToolkitConstants.FAILED_TO_CREATE_CLIENT_SCRIPT;
            if (newClientScripts.some((result) => result === false)) {
                this.executeDeleteFunctions(deleteFunctions);
                return errorMessage;
            } else {
                const oldScripts = clientScriptHandler.getRecordsByQuery(`macroponent=${macroponentId}`);
                const newScripts = clientScriptHandler.getRecordsByQuery(`macroponent=${newMacroponentId}`);

                // Loop through all of the old clientScripts and find the matching sys_id and map it so we can replace usages
                const replacementMap = { sysIds: {} };
                if (oldScripts) {
                    oldScripts.forEach((oldScript) => {
                        const matchingNewScript = newScripts.find((script) => script.name === oldScript.name);
                        replacementMap.sysIds[oldScript.sysId] = matchingNewScript.sysId;
                    });
                }
                // Replace client script sys_id usages to ensure they are pointed at the new event
                updatedMacroponent = this._replaceUsagesWithinMacroponent(updatedMacroponent, replacementMap);

                // Update our MCP with the new clientScript info replaced
                needsRecordUpdate = true;
            }
        }

        // Next we need to re-create any RELAY dispatched events and replace usages with the new versions
        const duplicatedRelayEventMap = eventHandler.copyRelayRecords(macroponentId, updatedMacroponent, scope);
        if (Object.keys(duplicatedRelayEventMap.sysIds).length > 0) {
            // Set up our deletion for the new ones just in case
            deleteFunctions.push({
                handler: eventHandler,
                records: Object.values(duplicatedRelayEventMap.sysIds)
            });

            // First fix up the dispatched_events in the field on the MCP
            const sysIdsToRemove = Object.keys(duplicatedRelayEventMap.sysIds);
            const sysIdsToAdd = Object.values(duplicatedRelayEventMap.sysIds);
            let dispatchedEvents = (updatedMacroponent.dispatchedEvents ?? '').split(',').reduce((acc, sys_id) => {
                if (!sysIdsToRemove.includes(sys_id)) {
                    acc.push(sys_id);
                }
                return acc;
            }, []);
            updatedMacroponent.dispatchedEvents = dispatchedEvents.concat(dispatchedEvents, sysIdsToAdd).join(',');

            // Replace event name usages to ensure they are pointed at the new event
            updatedMacroponent = this._replaceUsagesWithinMacroponent(updatedMacroponent, duplicatedRelayEventMap);

            // Update our MCP with the new relay event info replaced
            needsRecordUpdate = true;
        }

        const newAddonEventHandlers = addOnEventHandler.copyRecords(null, `parent_macroponent=${macroponentId}`, {
            parent_macroponent: newMacroponentId
        }, scope, domain);
        if (newAddonEventHandlers.length !== 0) {
            deleteFunctions.push({
                handler: addOnEventHandler,
                records: newAddonEventHandlers
            });
            errorMessage = BuilderToolkitConstants.FAILED_TO_CREATE_ADDON_EVENT_MAPPING;
            if (newAddonEventHandlers.some((result) => result === false)) {
                this.executeDeleteFunctions(deleteFunctions);
                return errorMessage;
            }
        }

        // Check for app routes that are tied to the MCP, but the screen is NOT a subscreen
        // We only copy those because the process of copying a subscreen via Page will catch the app routes of subpages
        const childAppRoutes = appRouteHandler.getRecordsByQuery(`parent_macroponent=${macroponentId}`, '', true);
        const newAppRoutes = [];
        if (childAppRoutes) {
            while (childAppRoutes.next()) {
                const screen = screenHandler.getRecordsByQuery(`screen_type=${childAppRoutes.getValue('screen_type')}`, '', true);
                if (screen && screen.next() && screen.getValue('parent_macroponent') !== macroponentId) {
                    newAppRoutes.push(appRouteHandler.copyRecord(childAppRoutes, null, {
                        parent_macroponent: newMacroponentId
                    }, scope, domain));
                }
            }
        }
        if (newAppRoutes.length !== 0) {
            deleteFunctions.push({
                handler: appRouteHandler,
                records: newAppRoutes
            });
            errorMessage = BuilderToolkitConstants.FAILED_TO_CREATE_APPROUTE;
            if (newAppRoutes.some((result) => result === false)) {
                this.executeDeleteFunctions(deleteFunctions);
                return errorMessage;
            }
        }

        // If we updated a field, we need to tell the server to update
        if (needsRecordUpdate) {
            this.updateRecord(updatedMacroponent);
        }

        return {
            newMacroponentId,
            newClientScripts,
            newAddonEventHandlers,
            relayEventReplacementMap: duplicatedRelayEventMap.names
        };
    },

    /** 
     * @param {object} macroponent - a camelCase or snake_case object with macroponent field values
     * @param {string|null} copyFrom - optional macroponent sys_id to copy from before applying object above
     */
    copyOrCreateRecord: function(macroponent, copyFrom) {
        let newMacroponent;
        if (copyFrom) {
            const copyFromRecord = this.getRecordById(copyFrom, true);
            if (copyFromRecord) {
                const {
                    newMacroponentId
                } = this.copy(copyFromRecord, undefined, undefined, macroponent);
                newMacroponent = newMacroponentId;
            } else {
                newMacroponent = {
                    error: true,
                    message: BuilderToolkitConstants.ERRORS.FAILED_TO_FIND_TEMPLATE
                };
            }
        } else {
            newMacroponent = this.createRecord(macroponent);
            if (typeof newMacroponent !== 'string') {
                newMacroponent = {
                    error: true,
                    message: BuilderToolkitConstants.ERRORS.FAILED_TO_CREATE_MACROPONENT
                };
            }
        }
        return newMacroponent;
    },

    getMacroponentAndRelatedRecords: function(macroponent, contextState, extensionPointControllerDefinitionIds) {
        if (!macroponent?.sys_id) {
            macroponent = this.getRecordById(macroponent, true);
        }

        const componentDefinitionHandler = new ComponentDefinitions();
        const controllerHandler = new Controller();
        const controllerPresetHandler = new ControllerPreset();
        const dataBrokerDefinitionHandler = new DataBrokerDefinitions();
        const presetHandler = new ComponentPreset();
        const macroponentValues = this.getValuesFromGlideRecord(macroponent);
        const {
            mcpIds,
            presetIds
        } = this.getCompositionReferenceIds(this.parseJSON(macroponent.getValue('composition'), {
            field: 'composition',
            sysId: macroponent.getUniqueValue()
        }));

		const componentPresetArr = presetHandler.getRecordsByQuery('sys_idIN' + presetIds);
        const presetDefinitions = presetHandler.convertPresetDefinitions(componentPresetArr);
        const bundleMcpIds = (macroponentValues.bundles ?? []).map(bundle => bundle.definitionId);
        const componentDefintions = componentDefinitionHandler.getComponentDefinitions([...bundleMcpIds, ...mcpIds, ...componentDefinitionHandler.ALWAYS_LOAD_COMPONENT_IDS], true);
        const componentDefinitionIds = componentDefintions.map(({
            macroponent
        }) => macroponent.sysId);
        const libComponentMcpIds = new global.ArrayUtil().diff(mcpIds, componentDefinitionIds);
        const libComponentDefinitions = new LibComponent().getComponentDefinitions(libComponentMcpIds);

        const allComponentDefinitions = [...componentDefintions, ...libComponentDefinitions];
        const allComponentMcpIds = allComponentDefinitions.map(({
            macroponent
        }) => macroponent.sysId);
        const filteredMcpIds = mcpIds.filter((id) => !allComponentMcpIds.includes(id));
        const macroponentDefinitions = this.getRecordsByQuery(`sys_idIN${filteredMcpIds}`);
        const embeddedMacroponentDefinitions = (macroponentDefinitions ?? []).reduce((acc, def) => {
            acc[def?.sysId] = def;
            return acc;
        }, {});

        // for Component type macroponents, we need to check for anywhere that another component uses this macroponent
        // that way we can filter those out of the toolbox to prevent infinite recursion
        const macroponentsToExcludeFromToolbox = [];
        if (macroponentValues.category === 'component') {
            const componentsUsingThisMacroponent = this.getRecordsByQuery(`category=component^compositionLIKE${macroponent.getUniqueValue()}`, 'name', true);
            if (componentsUsingThisMacroponent) {
                while (componentsUsingThisMacroponent.next()) {
                    macroponentsToExcludeFromToolbox.push(componentsUsingThisMacroponent.getUniqueValue());
                }
            }
        }

        macroponentValues.formFactors = new FormFactorHelper().getAllFormFactors(macroponentValues.formFactors);

        // Grab all embedded mcp event definition IDs
        const embeddedMacroponentDefinitionEvents = (Object.values(embeddedMacroponentDefinitions).reduce((acc, mcpDef) => {
            if (mcpDef?.dispatchedEvents) {
                acc = acc.concat(mcpDef?.dispatchedEvents);
            }
            if (mcpDef?.handledEvents) {
                acc = acc.concat(mcpDef?.handledEvents);
            }
            return acc;
        }, [])).toString();

        const addOnEventMappings = new UXAddOnEventMapping().getRecordsByQuery('parent_macroponent=' + macroponent.getUniqueValue());
        const dataBrokerDefinitions = dataBrokerDefinitionHandler.getMacroponentDataBrokerDefinitions(macroponent, contextState);
        const allData = [].concat(macroponentValues?.data ?? [], contextState?.parent?.data ?? [], contextState?.ancestor?.data ?? []);
        const controllersFromData = controllerHandler.getControllersFromData(allData);
        const controllersFromExternalControllerDependencies = controllerHandler.getControllersFromExternalControllerDependencies(macroponentValues?.extControllerDep ?? []);
        const allControllerDefinitions = [...controllersFromData, ...controllersFromExternalControllerDependencies, ...controllerHandler.getRecordsByQuery(`sys_idIN${extensionPointControllerDefinitionIds}`)];
        const controllerPresetIds = controllerHandler.getControllerPresetReferenceIds(allData);
		const controllerPresetArr = controllerPresetHandler.getRecordsByQuery('sys_idIN' + controllerPresetIds);
        const controllerPresetDefinitions = controllerPresetHandler.convertPresetDefinitions(controllerPresetArr);
        const parentHandledEventIds = contextState?.parent?.handledEvents?.reduce((acc, handler) => {
            return acc.concat(handler?.handledEvents);
        }, []);
        const ancestorHandledEventIds = contextState?.ancestor?.handledEvents?.reduce((acc, handler) => {
            return acc.concat(handler?.handledEvents);
        }, []);
        // Get all events for our MCP, dbs, components, controllers, parent mcp, and ancestor mcps, and public ones
        const allUxEventIds = `
                ${this.getAllEventSysIdFromMacroponentValues(macroponentValues)},
                ${this.getEventsFromSupportingRecords(componentDefintions, allControllerDefinitions, dataBrokerDefinitions)},
				${this.getEventsFromSupportingRecords([], [], [...(contextState?.parent?.data ?? []), ...(contextState?.ancestor?.data ?? [])])},
				${(parentHandledEventIds ?? '')},
                ${(ancestorHandledEventIds ?? '')},
				${(contextState?.extendsMacroponent?.handledEvents ?? '')},
				${(contextState?.upstreamMacroponents?.[macroponent.extends]?.handledEvents ?? '')},
				${embeddedMacroponentDefinitionEvents},
				${BuilderToolkitConstants.PUBLIC_MCP_EVENT_SYS_IDS}
            `.replace(/\s/g, '');
		
		const presetEventApiNames = presetHandler.getPresetEventDefinitionApiNames([...componentPresetArr, ...controllerPresetArr]);

        // We need to query by the eventIds we got, and our DB definition operation query too and we'll do that long query as a new Query
        const dataBrokerDefinitionOperationEventNameQuery = dataBrokerDefinitionHandler.getDataBrokerOperationsEventQuery(dataBrokerDefinitions);
        const eventDefinitionRecords = new UXEvent().getRecordsByQuery(`sys_idIN${allUxEventIds}${dataBrokerDefinitionOperationEventNameQuery.replace('^OR', '^NQ')}^ORevent_nameIN${presetEventApiNames}`, 'name');
        const eventDefinitions = [...eventDefinitionRecords, ...dataBrokerDefinitionHandler.getMutationDataBrokerDispatchedEvents(), ...dataBrokerDefinitionHandler.getRegularDataBrokerDispatchedEvents()];
		const rdf = new apiModules.RuleDismissFetcher();
		const dismissedRuleViolations = rdf.getGlideRecordRuleDismiss([macroponent.getUniqueValue()]);

        return {
            macroponent: macroponentValues,
            dataBrokerDefinitions,
            componentDefinitions: [...allComponentDefinitions, ...componentDefinitionHandler.getPseudoComponents()],
            clientScripts: new ClientScript().getRecordsByQuery('macroponent=' + macroponent.getUniqueValue()),
            controllerDefinitions: new Controller().convertControllerDefinitions(allControllerDefinitions),
            controllerPresetDefinitions,
            presetDefinitions,
            skillDefinitions: new SkillDefinitions().getSkillsFromData(allData),
            macroponentPublicHandledEvents: BuilderToolkitConstants.PUBLIC_MCP_EVENT_SYS_IDS,
            addOnEventMappings,
            eventDefinitions,
            embeddedMacroponentDefinitions,
            macroponentsToExcludeFromToolbox,
			dismissedRuleViolations: dismissedRuleViolations ? dismissedRuleViolations[0] : null,
			testValues: new ScreenTestValue().getRecordById(macroponent.getUniqueValue())
        };
    },

    getEventsFromSupportingRecords: function(componentDefinitions = [], controllerDefinitions = [], dataBrokerDefinitions = {}) {
        const componentEvents = componentDefinitions.reduce((acc, compDef) => {
            return acc.concat(compDef?.macroponent?.dispatchedEvents?.split(',') ?? [],
                compDef?.macroponent?.handledEvents?.split(',') ?? []);
        }, []);

        const controllerEvents = controllerDefinitions.reduce((acc, contDef) => {
            return acc.concat(contDef?.macroponent?.dispatchedEvents?.split(',') ?? [],
                contDef?.macroponent?.handledEvents?.split(',') ?? []);
        }, []);

        const dataBrokerEvents = Object.values(dataBrokerDefinitions).filter((dbDef) => dbDef?.macroponent).reduce((acc, dbDef) => {
            return acc.concat(dbDef?.macroponent?.dispatchedEvents?.split(',') ?? [],
                dbDef?.macroponent?.handledEvents?.split(',') ?? []);
        }, []);
        return [...componentEvents, ...controllerEvents, ...dataBrokerEvents].join(',');
    },

    /**
     * @param macroponentValues {Object} the page registry record for the screen
     */
    getAllEventSysIdFromMacroponentValues: function(macroponentValues) {
        const events = [...(macroponentValues?.handledEvents?.split(',') ?? []), ...(macroponentValues?.dispatchedEvents?.split(',') ?? [])];
        return events.join(',');
    },

    /**
     * @param macroponentGR {GlideRecord} either a macroponent GR or a macroponent sys_id
     * @param parentMacroponentSysId {string} the sys_id of a parent macroponent outside of the ancestor chain
     */
    getContextState: function(macroponentGR, parentMacroponentSysId) {
        let theme = '{}';

        // Adding try catch to protect us from any scriptable changes which are in global
        const experienceUsedByMCP = new Experience().getRecordsByQuery(`root_macroponent=${macroponentGR.getUniqueValue()}`, '', true);
        if (experienceUsedByMCP && experienceUsedByMCP.next()) {
            try {
                theme = UIBScriptables.getThemeForUIB(experienceUsedByMCP.getValue('admin_panel'), experienceUsedByMCP.getValue('parent_app'));
            } catch (err) {
                // No theme information is set for the page or parent app
            }
        }

        // Get the session Macroponent that provides @context.session and always include it
        const sessionDataBroker = new Macroponent().getRecordById(BuilderToolkitConstants.SESSION_DATABROKER_SYS_ID);

        // Get the parent macroponent if it's been given to us and add it to our upstream MCPs (Pages only)
        const parentMacroponent = this.getRecordById(parentMacroponentSysId);
        const upstreamMacroponents = {
            [BuilderToolkitConstants.SESSION_DATABROKER_SYS_ID]: sessionDataBroker,
            ...(macroponentGR.getValue('extends') ? this.getUpstreamMacroponents(macroponentGR.getValue('extends')) : {}),
            // If we have a parent MCP, we fetch just that parent and we add it to our upstreams
            ...(parentMacroponent ? {
                [parentMacroponentSysId]: parentMacroponent
            } : {})
        };

        return {
            upstreamMacroponents,
            subroutes: new Screen().getSubroutes(macroponentGR.getUniqueValue()),
            theme
        };
    },

    /**
     * @param macroponent {GlideRecord | string} either a macroponent GR or a macroponent sys_id
     * @param parentMacroponentSysId {string} the sys_id of a parent macroponent outside of the ancestor chain
     */
    getMCPEditorObject: function(macroponent, parentMacroponentSysId) {
        if (!macroponent?.sys_id) {
            macroponent = this.getRecordById(macroponent, true);
        }
        if (!macroponent) {
            return false;
        }

        const contextState = this.getContextState(macroponent, parentMacroponentSysId);
        const relatedRecords = this.getMacroponentAndRelatedRecords(macroponent, contextState);
        const lastUpgradeGR = new GlideRecord('sys_upgrade_history');
        lastUpgradeGR.orderByDesc('upgrade_started');
        lastUpgradeGR.setLimit(1);
        lastUpgradeGR.query();
        const lastUpgradeDT = lastUpgradeGR.next() ? new GlideDateTime(lastUpgradeGR.getValue('upgrade_started')) : null;
        const lastUpgrade = lastUpgradeDT ? lastUpgradeDT.getNumericValue() : null;

        return {
            ...relatedRecords,
            contextState,
            lastUpgrade
        };
    },

    getUpstreamMacroponents: function(upstreamMacroponent, upstreamMacroponents = {}) {
        const upstreamMacroponentValues = this.getRecordById(upstreamMacroponent);
        if (!upstreamMacroponentValues) {
            return upstreamMacroponents;
        }
        upstreamMacroponents[upstreamMacroponent] = upstreamMacroponentValues;
        return this.getUpstreamMacroponents(upstreamMacroponentValues['extends'], upstreamMacroponents);
    },

    /**
     * Replaces usages of a specific string within the composition, data, and internalEventMappings of the MCP
     * 
     * @param macroponent {recordValues} the jsonObject containg the processed version of the macroponent
     * @param replacementMap {object} the replacement object where keys are the things being replaced and the values are the new value
     */
    _replaceUsagesWithinMacroponent: function(macroponent, replacementMap) {
        const {
            names,
            sysIds
        } = replacementMap;
		// Need to replace all event names AND all event sysIds
        const combinedObject = {
            ...(names ?? {}),
            ...(sysIds ?? {})
        };
        let updatedMacroponent = {
            ...macroponent
        };
        const oldValues = Object.entries(combinedObject);
        if (oldValues.length > 0) {
            let composition = JSON.stringify(updatedMacroponent.composition ?? []);
            let data = JSON.stringify(updatedMacroponent.data ?? []);
            let internalEventMappings = JSON.stringify(updatedMacroponent.internalEventMappings ?? {});

            // Loop through all of the old values and find matches and replace all places where usages could exist
            oldValues.forEach(([oldValue, newValue]) => {
                composition = composition.replaceAll(oldValue, newValue);
                data = data.replaceAll(oldValue, newValue);
                internalEventMappings = internalEventMappings.replaceAll(oldValue, newValue);
            });
            updatedMacroponent.composition = JSON.parse(composition);
            updatedMacroponent.data = JSON.parse(data);
            updatedMacroponent.internalEventMappings = JSON.parse(internalEventMappings);
        }
        return updatedMacroponent;
    },

    type: 'Macroponent'
});
