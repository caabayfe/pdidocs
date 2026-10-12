const UIBTemplate = Class.create();
UIBTemplate.prototype = Object.extendsObject(BuilderToolkitAPIBase, {
    TABLE: 'sys_uib_template',
    FIELDS: ['label', 'description', 'type', 'macroponent', 'image', 'order', 'associated_types', 'optional_properties', 'required_properties', 'macroponent_config', 'template_categories'],
    FIELD_TYPES: {
        label: 'translated_field',
        description: 'translated_text',
        type: 'string',
        macroponent: 'reference',
        image: 'string',
        order: 'integer',
        associated_types: 'glide_list',
        optional_properties: "json",
        required_properties: 'json',
        macroponent_config: "json",
        template_categories : "glide_list"
    },

    /**
     * @param fields {string[]}
     */
    initialize: function(fields) {
        BuilderToolkitAPIBase.prototype.initialize.call(this, this.TABLE, fields || this.FIELDS, undefined, undefined, this.FIELD_TYPES);
    },

    /**
     * Overrides parent class function to inject special fields
     * @param acc {object} the accumulator object
     * @param field {GlideElement} the field element we are currently working on
     */
    getFieldValues: function(acc, field) {
        acc = BuilderToolkitAPIBase.prototype.getFieldValues.call(this, acc, field);
        const fieldName = field.getName();
        if (fieldName === 'associated_types') {
            acc['associatedTypes'] = field.getDisplayValue();
        } else if (fieldName === 'template_categories') {
			acc['templateCategories'] = field.getValue();
		} else if (fieldName === 'macroponent') {
            acc['layout'] = this.parseJSON(field.layout.toString(), {
                sysId: acc.sysId,
                field: 'layout'
            });

            // Get all component and DB defs for display in "learn more"
            const {
                componentDefinitions,
                dataBrokerDefinitions
            } = this.getTemplateComponentsAndDataBrokers(field.getRefRecord());
            acc['componentDefinitions'] = componentDefinitions;
            acc['dataBrokerDefinitions'] = dataBrokerDefinitions;
        } else if (fieldName === 'image') {
            acc['image'] = field.getDisplayValue();
        } else if (fieldName === 'required_properties' || fieldName === 'optional_properties') {
            const camelCaseFieldName = this._toCamelCase(fieldName);
            const properties = acc[camelCaseFieldName] ?? [];
            const testValues = properties.reduce(this.getTestValues, {});
            const enrichedProperties = properties.map((property) => {
                return {
                    ...property,
                    testValue: testValues[property?.name] ?? null
                };
            });
            acc[camelCaseFieldName] = enrichedProperties;
        }
        return acc;
    },

    /**
     * @param acc the accumulator that is gathering test values in a reduce
     * @param name {string} the name of the urlParam
     * @param testValue {string|number|boolean} a default test value to use if we can't get another
     * @param generator {string} the type of generator to use: gr (fetches from table), javascript (arbitrary script to execute)
     */
    getTestValues: function(acc, {
        name,
        testValue = null,
        generator = null
    }) {
        acc[name] = testValue;
        if (generator !== null) {
            const segments = generator.split(':');
            switch (segments[0]) {
                case 'gr':
                    if (segments.length !== 1) {
                        const recordLookup = new GlideRecord(segments[1]);
                        if (recordLookup.isValid()) {
                            recordLookup.addQuery('active', 'true');
                            recordLookup.query();
                            if (recordLookup.next()) {
                                acc[name] = recordLookup.getUniqueValue();
                            }
                        }
                    }
                    break;
                case 'javascript':
                    if (segments.length !== 1) {
                        acc[name] = this.evaluateScript(segments[1]);
                    }
                    break;
            }
        }
        return acc;
    },

    /**
     * Gets all legacy template records (macroponents with associated type "shared page")
     */
    getLegacyTemplateRecords: function() {
        const macroponentHandler = new Macroponent();
        const legacyTemplateGRs = macroponentHandler.getRecordsByQuery(BuilderToolkitConstants.LEGACY_TEMPLATE_QUERY, '', true);
        const legacyTemplates = [];
        if (legacyTemplateGRs) {
            while (legacyTemplateGRs.next()) {
                //const macroponentValues = macroponentHandler.getValuesFromGlideRecord(legacyTemplateGRs);
                // Get all component and DB defs for display in "learn more"
                const {
                    componentDefinitions,
                    dataBrokerDefinitions
                } = this.getTemplateComponentsAndDataBrokers(legacyTemplateGRs);
                legacyTemplates.push({
                    name: legacyTemplateGRs.getValue('name'),
                    sysId: legacyTemplateGRs.getValue('sys_id'),
                    description: legacyTemplateGRs.getValue('description'),
                    componentDefinitions,
                    dataBrokerDefinitions
                });
            }
        }
        return legacyTemplates;
    },

    /**
     * Gets all component and data resource definitions used within a template macroponent
     * @param macroponentGR {GlideRecord} the macroponent we are getting from
     */
    getTemplateComponentsAndDataBrokers: function(macroponentGR) {
        const composition = this.parseJSON(macroponentGR.getValue('composition'));
        const {
            mcpIds
        } = new Macroponent().getCompositionReferenceIds(composition, {
            field: 'composition',
            sysId: macroponentGR.getUniqueValue()
        });

        const componentsToDisplayQuery = `^macroponent.categoryINcomponent,primitives,shared^ORsys_scope.nameLIKE@servicenow^macroponent!=${BuilderToolkitConstants.CONTAINER_MACROPONENT_SYS_ID}`;
        const data = macroponentGR.data.nil() ? [] : this.parseJSON(macroponentGR.data, {
            sysId: macroponentGR.sysId || macroponentGR.getUniqueValue(),
            field: 'data'
        });
        const controllerHelper = new Controller(['name']);
        const controllerDefinitionsArray = controllerHelper.getControllersFromData(data ? data : []);
        const controllerDefinitions = controllerHelper.convertControllerDefinitions(controllerDefinitionsArray);
        const dataBrokerDefinitions = new DataBrokerDefinitions(null, ['name']).getMacroponentDataBrokerDefinitions(macroponentGR);
        const componentDefinitions = new ComponentDefinitions(['label', 'sys_scope']).getComponentDefinitions(mcpIds, false, componentsToDisplayQuery);

        return {
            componentDefinitions,
            dataBrokerDefinitions: {
                ...dataBrokerDefinitions,
                ...controllerDefinitions
            }
        };
    },

    checkForColumnLayouts: function(composition = []) {
        let hasColumns = false;
        composition.forEach((element) => {
            if (element?.scratchpad?.uib?.layout?.type?.indexOf('column') !== -1) {
                hasColumns = true;
            } else if (element?.overrides?.composition && element.overrides.composition.length != 0) {
                hasColumns = hasColumns || this.checkForColumnLayouts(element.overrides.composition);
            }
        });
        return hasColumns;
    },

    type: 'UIBTemplate'
});
