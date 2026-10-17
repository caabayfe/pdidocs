const ComponentBuilderMetadata = Class.create();
ComponentBuilderMetadata.prototype = Object.extendsObject(BuilderToolkitAPIBase, {
    TABLE: 'sys_cb_metadata',
    FIELDS: ['component', 'macroponent', 'preview_image', 'usage_guidelines'],
    FIELD_TYPE: {
        component: 'reference',
        macroponent: 'reference',
        preview_image: 'string',
        usage_guidelines: 'string'
    },
    CORE_ASSOCIATED_TYPES: 'd8899a0473000010f7353c78caf6a750',
    MCP_CATEGORY: 'component',
    RESPONSIVE_DEFAULT_CONTAINER_LAYOUT: {
        'default': {
            type: 'flex',
            root: null,
            children: null,
            rules: null,
            styles: {
                'flex-direction': 'column',
            },
            items: [],
            templateId: '5832fd4d53c31010e6bcddeeff7b12db',
        },
        version: '3.1.0',
    },
    MCP_DISPATCHED_EVENTS: [
        '882eed4091382d3a41f1bb3f382ae089',
        '8b82bf18e5276c8e423b6e4e0889b463',
    ],

    /**
     * @param fields {string[]}
     */
    initialize: function(fields, noDomain, includeDisplayValue) {
        BuilderToolkitAPIBase.prototype.initialize.call(this, this.TABLE, fields || this.FIELDS, noDomain, includeDisplayValue, this.FIELD_TYPE);
    },

    /**
     * Gets all the records associated with a component
     *
     * @param {string} sysId
     */
    getComponent(macroponentSysId, secondPass) {
        const macroponentHandler = new Macroponent();
        const componentHandler = new ComponentDefinitions();
        const propsConfigHandler = new PropsConfig();
        const macroponentRecord = macroponentHandler.getRecordById(macroponentSysId);
        if (macroponentRecord !== null) {
            const propsConfigRecord = this.getPropsConfigRecord(macroponentSysId);
            const componentValuesArr = componentHandler.getRecordsByQuery(`macroponent=${macroponentSysId}`);
            const toolboxRecord = componentValuesArr && componentValuesArr.length === 0 ? null : componentValuesArr[0];

            // fetching both toolbox & props config record, props config will take precedence
            const component = {
                ...(toolboxRecord ?? {}),
                ...propsConfigRecord,
                sysId: toolboxRecord ? toolboxRecord.sysId : macroponentRecord.sysId
            };
            result = {
                component,
                macroponent: macroponentRecord,
                searchFacets: toolboxRecord ? this.getSearchFacetsByComponentId(toolboxRecord.sysId) : null,
                testValues: new ScreenTestValue().getRecordById(macroponentSysId),
                adaptiveVariants: new AdaptiveMacroponentVariant().getVariantMap(macroponentSysId)
            };
            return result;
        } else {
            if (secondPass) {
                return null;
            } else {
                const cbMetaGR = this.getRecordById(macroponentSysId, true);
                if (cbMetaGR !== null) {
                    return this.getComponent(cbMetaGR.getValue('macroponent'), true);
                } else {
                    return null;
                }
            }
        }
    },

    /**
     * Creates all the records assoictes with a component
     *
     * @param {Object} fields}
     * @throws {CreateRecordException}
     * @returns {Object}
     */
    createComponent(fields) {
        const toolboxComponentHelper = new ComponentDefinitions();
        const screenTestValueHandler = new ScreenTestValue();
        const propsConfigHandler = new PropsConfig();
        const {
            name = '',
                description = '',
                icon = '',
                imageIcon = '',
                searchFacets = null,
                embeddable = {},
        } = fields;
        const {
            associatedType = this.CORE_ASSOCIATED_TYPES
        } = embeddable;
        const macroponentId = new Macroponent().createRecord({
            description,
            name,
            associatedTypes: associatedType,
            category: this.MCP_CATEGORY,
            layout: this.RESPONSIVE_DEFAULT_CONTAINER_LAYOUT,
            dispatched_events: this.MCP_DISPATCHED_EVENTS,
            disableAutoReflow: true
        });
        screenTestValueHandler.createRecord({
            macroponent: macroponentId,
            macroponentConfig: BuilderToolkitConstants.SCREEN_TEST_VALUE_MACROPONENT_CONFIG_DEFAULT_VALUE
        });
        const imageSysId = icon.match(/sys_id=([a-f0-9]+)/)?.[1];
        const toolboxIcon = imageSysId ? 'default' : icon,
            toolboxImage = imageSysId ? imageSysId : imageIcon;
        const toolboxId = toolboxComponentHelper.createRecord({
            description,
            icon: toolboxIcon,
            imageIcon: toolboxImage,
            macroponent: macroponentId,
            label: name
        });

        const propsConfigId = propsConfigHandler.createRecord({
            name,
            description,
            target: macroponentId,
            target_table: 'sys_ux_macroponent',
            icon: toolboxIcon,
            imageIcon: toolboxImage,
        });

        if (searchFacets) {
            new SearchFacetItemMappings().createSearchFacetM2Ms(toolboxId, toolboxComponentHelper.TABLE, searchFacets);
        }

        // We have to update and add the edit button AFTER the metadata id is created
        const externalConfigSources = [{
            label: 'Edit component',
            type: 'URL',
            configProperties: {
                url: `/now/builder/ui/component/${macroponentId}`,
            },
        }, ];

        toolboxComponentHelper.updateRecord({
            sysId: toolboxId,
            external_configuration_sources: externalConfigSources,
        });
        return {
            macroponentId
        };
    },

    /**
     * Deletes a component builder built component and all related records
     * 
     * @param {string} sysId
     */
    deleteComponent: function(sysId, secondPass) {
        const macroponentHandler = new Macroponent();
        const componentHandler = new ComponentDefinitions();
        const propsConfigHandler = new PropsConfig();
        const searchFacetItemMappingsHandlers = new SearchFacetItemMappings();
        const macroponentRecord = macroponentHandler.getRecordById(sysId, true);
		const adaptiveMacroponentHandler = new AdaptiveMacroponentVariant();

        if (macroponentRecord !== null) {
            new ScreenTestValue().deleteRecord(sysId);
            const components = componentHandler.getRecordsByQuery(`macroponent=${sysId}`, null, true);
            while (components && components.next()) {
                const componentSysId = components.sys_id.toString();
                searchFacetItemMappingsHandlers.updateSearchFacetM2Ms(componentSysId, componentHandler.TABLE, []);
                componentHandler.deleteRecord({
                    sysId: componentSysId
                });
            }
            const propsConfigRecord = this.getPropsConfigRecord(sysId);
            if (propsConfigRecord) {
                propsConfigHandler.deleteRecord({
                    sysId: propsConfigRecord.sysId
                });
            }

			const hasAdaptiveVariants = adaptiveMacroponentHandler.checkIfExisting(sysId);
			if(hasAdaptiveVariants){
				adaptiveMacroponentHandler.deleteVariantsAndMapping(sysId);
			}

            return macroponentHandler.deleteRecord({
                sysId
            });
        } else {
            if (secondPass) {
                return null;
            } else {
                const cbMetaGR = this.getRecordById(sysId, true);
                if (cbMetaGR !== null) {
                    return this.deleteComponent(cbMetaGR.getValue('macroponent'), true);
                } else {
                    return null;
                }
            }
        }

    },

    /**
     *
     * Updates all the records associated with a component
     *
     * @param {Object} data
     */
    updateComponent(data) {
        const {
            component,
            macroponent,
            searchFacets,
            testValues = {},
        } = data;
        const componentDefHandler = new ComponentDefinitions();
        const propsConfigHandler = new PropsConfig();
        const macroponentId = macroponent?.sysId;
        if (component?.sysId) {
            if (component?.imageIcon?.sys_id) {
                component.imageIcon = component?.imageIcon?.sys_id;
            }
            componentDefHandler.updateRecord(component);
            if (Array.isArray(searchFacets)) {
                new SearchFacetItemMappings().updateSearchFacetM2Ms(component?.sysId, componentDefHandler.TABLE, searchFacets);
            }
        }
        if (macroponentId) {

            const propsConfigData = {
                name: component.label || component.name,
                description: component.description,
                target: macroponentId,
                targetTable: 'sys_ux_macroponent',
                icon: component.icon,
                imageIcon: component.image_icon,

            };
            if (component.configLayout !== undefined) {
                propsConfigData.configLayout = component.configLayout;
            }
            if (component.scriptedConfigPolicy !== undefined) {
                propsConfigData.scriptedConfigPolicy = component.scriptedConfigPolicy;
            }

            const propsConfigRecord = this.getPropsConfigRecord(macroponentId);
            if (propsConfigRecord) {
                propsConfigHandler.updateRecord({
                    ...propsConfigData,
                    sysId: propsConfigRecord.sysId
                });
            } else {
                propsConfigHandler.createRecord(propsConfigData);
            }



            new Macroponent().updateRecord(macroponent);
            new ScreenTestValue().updateRecord({
                macroponentConfig: testValues,
                macroponent: macroponentId
            });
        }
    },

    /**
     * Duplicates a CB built component and all related records
     * 
     * @param {string} sysId
     */
    duplicateComponent: function(sysId, fields, secondPass) {
        const {
            name = '',
                description = '',
                icon = '',
                imageIcon,
        } = fields;
        const macroponentHandler = new Macroponent();
        const searchFacetHelper = new SearchFacetItemMappings();
        const toolboxComponentHelper = new ComponentDefinitions();
        const propsConfigHelper = new PropsConfig();
        const screenTestValueHandler = new ScreenTestValue();
        const macroponentRecord = macroponentHandler.getRecordById(sysId, true);
        if (macroponentRecord === null) {
            if (secondPass) {
                return null;
            } else {
                const cbMetaGR = this.getRecordById(sysId, true);
                if (cbMetaGR !== null) {
                    return this.duplicateComponent(cbMetaGR.getValue('macroponent'), fields, true);
                } else {
                    return null;
                }
            }
        }
        // First copy the MCP because it has no references to anything else
        // first undefined is for scope
        // second undefined is for domain
        const {
            newMacroponentId
        } = new Macroponent().copy(sysId, undefined, undefined, {
            name,
            description
        });

        //Screen test values because it needs MCP
        const screenTestValueId = screenTestValueHandler.copyRecord(sysId, newMacroponentId);

        // Then the Toolbox component because it needs MCP
        const toolboxComponentRecords = toolboxComponentHelper.getRecordsByQuery(`macroponent=${sysId}`, null, true);
        while (toolboxComponentRecords && toolboxComponentRecords.next()) {
            const ogToolboxId = toolboxComponentRecords.getUniqueValue();
            const newToolboxId = toolboxComponentHelper.copyRecord(toolboxComponentRecords, null, {
                macroponent: newMacroponentId,
                label: name,
                description,
                icon,
                imageIcon: imageIcon?.sysId || imageIcon || ''
            });

            // Copy all search facets since they need the new toolbox component
            searchFacetHelper.copyRecords(null, `target_id=${ogToolboxId}`, {
                targetId: newToolboxId
            });
        }

        const propsConfigRecords = propsConfigHelper.getRecordsByQuery(`target=${sysId}`, null, true);
        const propsConfigData = {
            name,
            target: newMacroponentId,
            target_table: 'sys_ux_macroponent',
            description,
            icon,
            imageIcon: imageIcon?.sysId || imageIcon || ''
        };
        if (propsConfigRecords) {
            while (propsConfigRecords.next()) {
                const ogPropsConfigId = propsConfigRecords.getUniqueValue();
                const newpropsConfigId = propsConfigHelper.copyRecord(propsConfigRecords, null, propsConfigData);
            }
        } else {
            propsConfigHelper.createRecord(propsConfigData);
        }

        return this.getComponent(newMacroponentId);
    },

    /**
     * Gets all of the search facets asscociated with a toolbox component record
     *
     * @param {string} componentId
     * @returns {{id: string, label: string}[]}
     */
    getSearchFacetsByComponentId(componentId) {
        const facetItems = [];
        const searchFacetMappings = new SearchFacetItemMappings().getRecordsByQuery(`target_id=${componentId}`, 'search_facet_item.search_facet.order', true);
        if (searchFacetMappings) {
            while (searchFacetMappings.next()) {
                facetItems.push({
                    id: searchFacetMappings.search_facet_item.toString(),
                    label: searchFacetMappings.search_facet_item.getDisplayValue(),
                });
            }
        }

        return facetItems;
    },

    /**
     * Gets props config records where target = provided mcp Id
     *
     * @param {string} macroponentSysId
     * @returns GR
     */
    getPropsConfigRecord(macroponentSysId) {
        const propsConfigHandler = new PropsConfig();
        const propsConfigArr = propsConfigHandler.getRecordsByQuery(`target=${macroponentSysId}`);
        const propsConfigRecord = propsConfigArr && propsConfigArr.length === 0 ? null : propsConfigArr[0];
        return propsConfigRecord;
    },

    type: 'ComponentBuilderMetadata'
});
