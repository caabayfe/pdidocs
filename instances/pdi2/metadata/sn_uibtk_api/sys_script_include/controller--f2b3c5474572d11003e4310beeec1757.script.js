const Controller = Class.create();
Controller.prototype = Object.extendsObject(BuilderToolkitAPIBase, {
    TABLE: 'sys_ux_controller',
    FIELDS: ['name', 'controller_config_guidance', 'controller_macroponent', 'description', 'sys_id'],
    FIELD_TYPES: {
        name: 'translated_field',
        controller_config_guidance: 'json',
        controller_macroponent: 'reference',
        description: 'translated_text'
    },

    /**
     * @param fields {string[]}
     */
    initialize: function(fields = null) {
        BuilderToolkitAPIBase.prototype.initialize.call(this, this.TABLE, fields ?? this.FIELDS, undefined, undefined, this.FIELD_TYPES);
    },

    getRecordsByQuery: function(encodedQuery, orderBy, shouldReturnGR) {
        const controllerGRs = BuilderToolkitAPIBase.prototype.getRecordsByQuery.call(this, encodedQuery, orderBy, shouldReturnGR);
        if (!shouldReturnGR) {
            const propsConfigHandler = new PropsConfig();
            return propsConfigHandler.addPropConfigToResponse(controllerGRs, this.TABLE);
        }
        return controllerGRs;
    },

    /**
     * Overrides parent class function to inject macroponent
     * @param acc {object} the accumulator object
     * @param field {GlideElement} the field element we are currently working on
     */
    getFieldValues: function(acc, field) {
        acc = BuilderToolkitAPIBase.prototype.getFieldValues.call(this, acc, field);
        const fieldName = field.getName();

        if (fieldName === 'controller_macroponent' && !field.nil()) {
            // Inject our full macroponent to make it useful
            acc.macroponent = new Macroponent().getRecordById(acc.controllerMacroponent);
            acc.controllerMacroponentSysId = acc.controllerMacroponent;
            delete acc.controllerMacroponent;
        } else if (fieldName === 'controller_config_guidance' && !field.nil()) {
            const defaultsJSON = acc['controllerConfigGuidance'];
            if (defaultsJSON) {
                const propMappings = defaultsJSON.propMapping;
                const hydratedPropMappings = Object.keys(propMappings ?? {}).reduce((mappingAcc, key) => {
                    mappingAcc[key] = this.getTestValue(propMappings[key]);
                    return mappingAcc;
                }, {});
                acc['controllerConfigGuidance'] = {
                    ...defaultsJSON,
                    propMapping: hydratedPropMappings
                };
            }
        }
        return acc;
    },

    getBasicDetails: function() {
        const recordGR = this.get(this.table, '', 'name');
        const records = {};
        while (recordGR.next()) {
            records[recordGR.getUniqueValue()] = {
                ...this.getValuesFromGlideRecord(recordGR),
                controllerMacroponentSysId: recordGR.getValue('controller_macroponent')
            };
        }

        return records;
    },

    /**
     * @param sysIds {string} a comma separated list of sys_ids to query for, null to query all
     */
    getControllersAndDataBrokers: function(sysIds) {
        const controllerQuery = sysIds ? `sys_idIN${sysIds}` : '';

        const controllerRecords = this.getRecordsByQuery(controllerQuery);
        const externalControllerDependentSysIds = controllerRecords.reduce((acc, controller) => {
            if (controller.macroponent?.extControllerDep && controller.macroponent?.extControllerDep.length > 0) {
                acc = [...acc, controller.macroponent?.extControllerDep.map(({
                    controllerSysId
                }) => controllerSysId)];
            }
            return acc;
        }, []);
        // We need to also fetch all of the external controller dependency definitions if they exist
        const externalControllerRecords = externalControllerDependentSysIds.length > 0 ? this.getRecordsByQuery(`sys_idIN${externalControllerDependentSysIds.join(',)')}`) : [];
        const combinedControllerRecords = [...controllerRecords, ...(externalControllerRecords ? externalControllerRecords : [])];
        const controllerDefinitions = this.convertControllerDefinitions(combinedControllerRecords);
        const controllerEventIds = (controllerRecords ?? []).reduce((acc, {
            macroponent
        }) => {
            return acc.concat(macroponent?.handledEvents?.split(',') ?? [], macroponent?.dispatchedEvents?.split(',') ?? [])
        }, []);
        const dependentDatabrokerIds = Object.values(controllerDefinitions).reduce((acc, controllerDefinition) => {
            return acc.concat(controllerDefinition?.macroponent?.data?.map(({
                definition
            }) => definition?.id));
        }, []);
        const dataBrokerDefinitionsAndEvents = new DataBrokerDefinitions().getDatabrokerDefinitions(dependentDatabrokerIds);
        const controllerEventDefinitions = new UXEvent().getRecordsByQuery(`sys_idIN${controllerEventIds.join(',')}`, 'name');
        return {
            controllerDefinitions,
            dataBrokerDefinitions: dataBrokerDefinitionsAndEvents.dataBrokerDefinitions,
            eventDefinitions: this._mergeEventDefinitions(controllerEventDefinitions, dataBrokerDefinitionsAndEvents.eventDefinitions)
        };
    },

    /**
     * @param data {array} an array of data elements from an MCP
     */
    getControllersFromData: function(data = []) {
        const controllerIds = data.reduce(function(acc, broker) {
            if (broker?.definition?.type === 'CONTROLLER') {
                acc.push(broker?.definition?.id);
            }
            return acc;
        }, []);
        const controllerDefinitions = this.getRecordsByQuery('sys_idIN' + controllerIds);
        return controllerDefinitions;
    },

    /**
     * @param externalControllerDependencies {array} an array of external controller dependencies from an MCP
     */
    getControllersFromExternalControllerDependencies: function(externalControllerDependencies = []) {
        const controllerIds = externalControllerDependencies.map(function(acc, {
            controllerSysId
        }) {
            return controllerSysId;
        });
        const controllerDefinitions = this.getRecordsByQuery('sys_idIN' + controllerIds);
        return controllerDefinitions;
    },

    /**
     * @param data {array} an array of data elements from an MCP
     */
    getControllerPresetReferenceIds: function(data = []) {
        return data.reduce(function(acc, broker) {
            if (broker?.definition?.type === 'CONTROLLER' && broker?.preset?.id) {
                acc.push(broker.preset.id);
            }
            return acc;
        }, []);
    },

    /**
     * @param controllerDefinitions {array} an array of controller definitions
     */
    convertControllerDefinitions: function(controllerDefinitions) {
        return controllerDefinitions.reduce(function(acc, def) {
            acc[def.sysId] = def;
            return acc;
        }, {});
    },

    /**
     * @param mapping {string} a string with the type of generator to use in this format: "gr:tableName"
     * Possible options:
     * 		gr:tableName (returns first active record sys_id)
     * 		empty (returns the static test value)
     */
    getTestValue: function(mapping) {
        if (mapping.generator) {
            const segments = mapping.generator.split(":");
            switch (segments[0]) {
                case "gr":
                    if (segments.length === 1) {
                        return {
                            ...mapping,
                            testValue: mapping.testValue
                        };
                    }
                    const [table, query] = segments[1].split('?');
                    const recordLookup = new GlideRecord(table);
                    if (recordLookup.isValid()) {
                        if (query) {
                            recordLookup.addEncodedQuery(query);
                        } else {
                            recordLookup.addQuery("active", "true");
                        }
                        recordLookup.setLimit(1);
                        recordLookup.setNoCount();
                        recordLookup.query();
                        if (recordLookup.next()) {
                            return {
                                ...mapping,
                                value: mapping.valueType === "param" || mapping.valueType === "field" ? mapping.value : recordLookup.getUniqueValue(),
                                testValue: recordLookup.getUniqueValue()
                            };
                        }
                    }

                    return {
                        ...mapping,
                        testValue: mapping.testValue
                    };
                default:
                    return {
                        ...mapping,
                        testValue: mapping.testValue
                    };
            }
        } else {
            return {
                ...mapping,
                testValue: mapping.testValue
            };
        }
    },

    /**
     * @param extensionPointGR {GlideRecord} the extension point record we are getting controllers from
     */
    getExtensionPointControllers: function(extensionPointGR) {
        const that = this;
        if (!extensionPointGR) {
            return {
                embeddedExtensionPointControllers: null,
                extensionPointController: null
            };
        }
        if (!extensionPointGR.controller.nil()) {
            // We start that the top level controller and work our way down the dependency chain
            const embeddedControllers = that.createControllerDependenciesRecursive(extensionPointGR.controller.toString(), {
                controllerSysId: extensionPointGR.controller.toString(),
                name: 'controller',
                label: extensionPointGR.controller.getDisplayValue()
            });
            return {
                embeddedExtensionPointControllers: embeddedControllers,
                extensionPointController: extensionPointGR.controller.toString()
            };
        } else if (!extensionPointGR.controller_dependencies.nil()) {
            const controllerDependencies = that.parseJSON(extensionPointGR.controller_dependencies, {
                field: 'controller_dependencies',
                sysId: extensionPointGR.sysId || extensionPointGR.getUniqueValue()
            });
            // We just take what the user gives us, shape it, and go
            const embeddedControllers = (controllerDependencies ?? []).map((dep) => (that.createControllerDependency(dep, controllerDependencies)));
            return {
                embeddedExtensionPointControllers: embeddedControllers,
                extensionPointController: null
            };
        }
        return {
            embeddedExtensionPointControllers: [],
            extensionPointController: null
        };
    },

    /**
     * @oaram controllerSysId {string} id of the controller we are doing depedencies for
     * @param depedencyInfo {object} an object containing the depdenency from the upstream MCP extControllerDep field
     */
    createControllerDependenciesRecursive: function(controllerSysId, dependencyInfo) {
        const that = this;
        const controllerGR = that.getRecordsByQuery(`sys_id=${controllerSysId}^ORcontroller_macroponent.sys_id=${controllerSysId}`, 'name', true);
        if (controllerGR && controllerGR.next()) {
            const controllerMacroponentGR = controllerGR.controller_macroponent.getRefRecord();
            const controllerDependencies = controllerMacroponentGR?.ext_controller_dep.nil() ? [] : this.parseJSON(controllerMacroponentGR.getValue('ext_controller_dep'));
            const dependencyObject = controllerDependencies.reduce((depAcc, dep) => {
                const targetElementId = `${dep?.name}`;
                depAcc[dep?.name] = targetElementId;
                return depAcc;
            }, {});
            const allDependentControllers = [{
                sysId: controllerGR.getUniqueValue(),
                dependencies: dependencyObject,
                elementId: dependencyInfo?.name,
                elementLabel: dependencyInfo?.label
            }];

            return allDependentControllers.concat(controllerDependencies.reduce((acc, dependency) =>
                acc.concat(that.createControllerDependenciesRecursive(dependency?.controllerSysId, dependency)), []));
        }
        return [];
    },

    /**
     * @param dependency {object} a dependency either from the XP record dependencies or from the Controller -> MCP -> External controller dependencies
     * @param extPtControllerDependencies {array} an array of controller dependency objects from the Page collection
     */
    createControllerDependency: function(dependency, extPtControllerDependencies) {
        const controllerId = dependency?.controllerSysId ?? dependency?.definition?.id;
        const controllerGR = this.getRecordsByQuery(`sys_id=${controllerId}^ORcontroller_macroponent.sys_id=${controllerId}`, 'name', true);
        if (controllerGR && controllerGR.next()) {
            const controllerDependencies = this.parseJSON(controllerGR?.controller_macroponent?.ext_controller_dep, {
                field: 'controller_macroponent.ext_controller_dep',
                sysId: controllerGR.sysId || controllerGR.getUniqueValue()
            }) ?? [];
            const dependencies = (controllerDependencies ?? []).reduce((acc, dep) => {
                const targetElementId = (extPtControllerDependencies ?? []).find(cDep => cDep?.definition?.id === dep?.controllerSysId)?.depKey ?? '' + dep?.name;
                acc[dep?.name] = targetElementId;
                return acc;
            }, {});

            return {
                sysId: controllerGR.getUniqueValue(),
                dependencies: dependencies,
                elementId: dependency?.name ?? dependency?.depKey,
                elementLabel: dependency?.label ?? dependency?.definition?.name
            };
        }
        return null;
    },

    _mergeEventDefinitions: function(firstArray, secondArray) {
        const mergeCheck = (a, b) => a === b;
        const mergedArray = [...firstArray]; // copy to avoid side effects
        // add all items from secondArray to copy if they're not already present
        secondArray.forEach((secondItem) => (mergedArray.some((newItem) => mergeCheck(secondItem, newItem)) ? null : mergedArray.push(secondItem)))
        return mergedArray;
    },

    type: 'Controller'
});
