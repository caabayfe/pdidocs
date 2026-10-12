const ComponentDefinitions = Class.create();
ComponentDefinitions.prototype = Object.extendsObject(BuilderToolkitAPIBase, {
    TABLE: 'sys_uib_toolbox_component',
    CB_METADATA_TABLE: 'sys_cb_metadata',
    FIELDS: ['external_configuration_sources', 'image_icon', 'scripted_config_policy', 'config_layout', 'group_icon', 'group', 'group_category', 'description', 'icon', 'order', 'component_config', 'internal_component', 'label', 'image_icon'],
    FIELD_TYPE: {
        external_configuration_sources: 'json',
        image_icon: 'string',
        scripted_config_policy: "string",
        config_layout: 'json',
        group_icon: 'string',
        group: 'reference',
        group_category: 'translated_text',
        description: 'translated_text',
        icon: 'string',
        order: 'integer',
        component_config: "json",
        internal_component: 'boolean',
        label: 'translated_field'
    },
    ALWAYS_LOAD_COMPONENT_IDS: ['7b118d1a488556fd61bd3652c33045b2', 'bb42b12a89b52510f8773c9ea5ab982f', '6751e8d15b330010b913cbd59b81c79d', 'c4c3a0555b330010b913cbd59b81c7d5', '0cd364555b330010b913cbd59b81c73e', 'dddf6e9b4e48a1d4e54d5146573da438', '588fb4d2b7101010b9131a91de11a943', 'a7620672dcd3bf27682407c58ea8155b', '3ea20b6ac9640a4d328e0f26c3ab2c07', '49f8386797ee87db5a39da2e3d7a39c3', '50436e784311311011d75aaa3ab8f296'], // Container, Modals, Popovers,Modeless Dialog,Modeless Dialog Bundle
    /** @type {Map<string, string> | null} */
    TOOLBOX_METADATA_ID_MAP: null,
    /**
     * @param fields {string[]}
     */
    initialize: function(fields, noDomain, includeDisplayValue) {
        BuilderToolkitAPIBase.prototype.initialize.call(this, this.TABLE, fields || this.FIELDS, noDomain, includeDisplayValue, this.FIELD_TYPE);
    },

    /**
     * Builds a sys_uib_toolbox_component.sys_id -> sys_cb_metadata.sys_id id map for referencing Component Builder components
     * @return {Map<string, string>}
     */
    getComponentBuilderSysIdMap: function() {
        const cbMetadataGR = new BuilderToolkitAPIBase(this.CB_METADATA_TABLE).getRecordsByQuery('', '', true);
        const toolboxComponentIdMap = new Map();

        if (!cbMetadataGR) return toolboxComponentIdMap;

        while (cbMetadataGR.next()) {
            toolboxComponentIdMap.set(
                cbMetadataGR.component.toString(), // toolbox component sysId
                cbMetadataGR.getUniqueValue() // component builder metadata sysId
            );
        }

        return toolboxComponentIdMap;
    },

    /**
     * @param {string} toolboxComponentId
     * @return {boolean}
     */
    getComponentBuilderMetadataId: function(toolboxComponentId) {
        // TOOLBOX_METADATA_ID_MAP is null by default, Map when set (even if empty)
        if (!this.TOOLBOX_METADATA_ID_MAP) {
            this.TOOLBOX_METADATA_ID_MAP = this.getComponentBuilderSysIdMap();
        }

        return this.TOOLBOX_METADATA_ID_MAP.get(toolboxComponentId) || null;
    },

    /**
     * @param sysIds {string} a comma-separated list of sys_ids to query by
     * @param loadMacroponent {boolean} true if we should include the full macroponent in the Definition
     * @param additionalEncodedQuery {string} an additional encoded query to append, MUST start with ^, ^OR, or ^NQ
     */
    getComponentDefinitions: function(sysIds, loadMacroponent, additionalEncodedQuery = '') {
		const searchFacetM2M = new SearchFacetItemMappings();
        const macroponentHandler = new Macroponent();
        // We ignore components without labels or associated_types
        let query = 'labelISNOTEMPTY';
        if (sysIds) {
            query += `^sys_idIN${sysIds}^ORmacroponent.sys_idIN${sysIds}`;
        }
        // Our additional query MUST provide
        if (additionalEncodedQuery) {
            query += `${additionalEncodedQuery}`;
        }
        const componentsGR = this.getRecordsByQuery(query, 'label', true);
        if (!componentsGR) {
            return [];
        }

        const internalComponentVisibilityCheck = gs.getProperty('glide.uxbuilder.display_internal_components', 'false') === 'true' ||
            gs.hasRole('maint');
        const componentDefinitionValues = [];
        while (componentsGR.next()) {
			const componentId = componentsGR.getUniqueValue();
            const componentDefinition = this.getValuesFromGlideRecord(componentsGR);
			const scopeRecord = componentsGR.sys_scope.getRefRecord();
            let internalComponentDefinitions = [];

            if (loadMacroponent) {
                const macroponent = componentsGR.macroponent.getRefRecord();
                const macroponentValues = macroponentHandler.getValuesFromGlideRecord(macroponent);
                const macroponentValuesFromHierarchy = macroponentHandler.getHierarchyValues(macroponent);
                macroponentValues.props = macroponentValuesFromHierarchy.props;
                macroponentValues.handledEvents = macroponentValuesFromHierarchy.handledEvents;
                macroponentValues.dispatchedEvents = macroponentValuesFromHierarchy.dispatchedEvents;
                componentDefinition.macroponent = macroponentValues;
                componentDefinition.hideInToolbox = !internalComponentVisibilityCheck && componentsGR.internal_component.toString() === 'true';
                componentDefinition.isEditable = macroponent.getUniqueValue() === 'a04c00820f901010a326b6ade7767ef9'; // Record Tabs ID
                componentDefinition.rootComponentTag = this.getRootComponentTag(macroponent);
                componentDefinition.imageIcon = componentsGR.image_icon.getDisplayValue();
                componentDefinition.associatedTypes = componentsGR.macroponent.associated_types.toString();
                componentDefinition.componentBuilderMetadataId = this.getComponentBuilderMetadataId(componentId);
				componentDefinition.searchFacetData = searchFacetM2M.getSearchFacetsByTargetId(componentId);
                componentDefinition.sysScope = {
                    value: componentsGR.sys_scope.toString(),
                    displayValue: componentsGR.sys_scope.getDisplayValue(),
                    scopeName: scopeRecord.scope,
                    vendor: scopeRecord.vendor || BuilderToolkitConstants.SERVICENOW
				};

                if (macroponent.category.toString() === 'bundle' || macroponent.category.toString() === 'modeless_dialog_bundle') {
                    internalComponentDefinitions = this.getInternalComponentDefinitions(macroponentHandler, componentsGR.macroponent);
                }

            }
            componentDefinitionValues.push(componentDefinition);
            componentDefinitionValues.push(...internalComponentDefinitions);

        }
        return componentDefinitionValues;
    },

    /**
     * Gets all of the components that have a Group to them
     */
    getGroupComponentDefinitions: function() {
        const groupedComponents = [];
        let memberComponentDefinitions = [];
        const groupedComponentGR = this.get('sys_uib_toolbox_group');
        while (groupedComponentGR.next()) {
            const memberComponentSysIds = this.getGroupMemberComponentIds(groupedComponentGR.getUniqueValue());
            groupedComponents.push({
                icon: groupedComponentGR.getValue('icon'),
                description: gs.getMessage(groupedComponentGR.getValue('description')),
                label: groupedComponentGR.label.getDisplayValue(),
                baseMacroponent: new Macroponent().getRecordById(groupedComponentGR.getValue('base_macroponent')),
                members: memberComponentSysIds
            });
            const childComponentDefinitions = this.getComponentDefinitions(memberComponentSysIds.join(','), false);
            memberComponentDefinitions = memberComponentDefinitions.concat(childComponentDefinitions);
        }
        return {
            groupedComponents,
            memberComponentDefinitions
        };
    },

    /**
     * @param groupComponentSysId {string} the sys_id of the component group to query by
     */
    getGroupMemberComponentIds: function(groupComponentSysId) {
        const members = [];
        const memberGR = this.getRecordsByQuery("group=" + groupComponentSysId, 'label', true);
        while (memberGR.next()) {
            members.push(memberGR.getUniqueValue());
        }

        return members;
    },

    getInterfaceComponents: function() {
        const uibInterfacedComponents = BuilderToolkitConstants.UIB_INTERFACE_COMPONENTS;
        const javaInterfacedComponents = UIBScriptables.getInterfacedComponents();
        const allTagBasedInterfaceComponents = {
            ...uibInterfacedComponents,
            ...javaInterfacedComponents

        };
        const tagBasedComponentsMap = Object.entries(allTagBasedInterfaceComponents).reduce((acc, [key, value]) => {
            acc[key] = {
                interfaceName: key,
                componentId: value
            };
            return acc;
        }, {});
        const interfaceTableComponents = new BuilderToolkitAPIBase(BuilderToolkitConstants.INTERFACE_COMPONENT_TABLE).getRecordsByQuery('', '', true);
        let interfaceTableComponentsMap = {};
        if (interfaceTableComponents) {
            while (interfaceTableComponents.next()) {
                const interfaceName = interfaceTableComponents.applicable_interface.api_name.toString();
                interfaceTableComponentsMap[interfaceName] = {
                    interfaceName,
                    macroponentSysId: interfaceTableComponents.getValue('config_macroponent')
                };
            }
        }

        return {
            ...tagBasedComponentsMap,
            ...interfaceTableComponentsMap
        };
    },

    /**
     * Gets all of the psuedo components with their fake scaffolding
     */
    getPseudoComponents: function() {
        return [{
            icon: "tile-uib-viewport-1-sm",
            label: gs.getMessage('Viewport'),
            description: gs.getMessage('A viewport component can be added anywhere on the page without being in context of tabs. Create sub-pages, specify audiences, or customize content with different data, routes, and screens.'),
            rootComponentTag: 'now-uxf-viewport',
            category: 'viewport',
            sysId: 'viewport',
            macroponent: {
                category: "viewport",
                sysId: "MACROPONENT_VIEWPORT_HEADLESS"
            },
            sysScope: {
                vendor: BuilderToolkitConstants.SERVICENOW
            }
        }, {
            icon: "tile-uib-repeater-1-sm",
            label: gs.getMessage('Repeater'),
            description: gs.getMessage('Define components to be repeated. You can control how many times each component is repeated and the data that populates the components.'),
            rootComponentTag: 'now-uxf-repeater',
            category: 'repeater',
            sysId: 'repeater',
            macroponent: {
                category: "repeater",
                sysId: "REPEATER"
            },
            sysScope: {
                vendor: BuilderToolkitConstants.SERVICENOW
            }
        }, {
            icon: "tile-uib-conditional-1-sm",
            label: gs.getMessage('Conditional renderer'),
            description: gs.getMessage('Set up many conditions, and display the content of the first one that passes. This gives you a different option from having to manage visibility for multiple components separately.'),
            rootComponentTag: 'now-uxf-conditional',
            category: 'conditional',
            sysId: 'conditional',
            macroponent: {
                category: "conditional",
                sysId: "CONDITIONAL"
            },
            sysScope: {
                vendor: BuilderToolkitConstants.SERVICENOW
            }
        }];
    },

    /**
     * @param macroponentGR {GlideRecord} the macroponent we are getting a component tag for
     * @param depth {number} a number to safety check us against infinite loops
     */
    getRootComponentTag: function(macroponentGR, depth = 0) {
        //Return early if macroponentGR is null, especially in the recursive case
        if (!macroponentGR) {
            return null;
        }
        if (depth > 20) {
            gs.error("Hit depth limit, there is likely an infinite loop in extends field in macroponent: " + macroponentGR.sys_id.toString());
            return null;
        }
        return !macroponentGR.root_component.nil() ? macroponentGR.root_component.tag.toString() : this.getRootComponentTag(macroponentGR['extends'], depth + 1);
    },

    /**
     * Gets the minimum info needed for the Component Toolbox list of components
     */
    getToolboxComponents: function() {
        const searchFacetM2M = new SearchFacetItemMappings();
        const query = 'labelISNOTEMPTY^ORmacroponent.associated_typesISNOTEMPTY^ORmacroponent.category=bundle^ORmacroponent.category=modeless_dialog_bundle';
        const componentsGR = this.getRecordsByQuery(query, 'label', true);
        if (!componentsGR) {
            gs.warn('No components found');
            return [];
        }

        const internalComponentVisibilityCheck = gs.getProperty('glide.uxbuilder.display_internal_components', 'false') === 'true' ||
            gs.hasRole('maint');
        const componentDefinitions = [];

        while (componentsGR.next()) {
            const componentId = componentsGR.getUniqueValue();
            const scopeRecord = componentsGR.sys_scope.getRefRecord();
            componentDefinitions.push({
                label: componentsGR.label.getDisplayValue(),
                description: componentsGR.description.getDisplayValue(),
                group: componentsGR.group.toString(),
                groupCategory: componentsGR.group_category.getDisplayValue(),
                groupIcon: componentsGR.group_icon.toString(),
                id: componentsGR.macroponent.toString(),
                icon: componentsGR.icon.toString(),
                order: componentsGR.order.nil() ? undefined : parseInt(componentsGR.order.toString()),
                imageIcon: componentsGR.image_icon.getDisplayValue(),
                category: componentsGR.macroponent.category.toString(),
                associatedTypes: componentsGR.macroponent.associated_types.toString(),
                sysId: componentsGR.getUniqueValue(),
                rootComponentTag: this.getRootComponentTag(componentsGR.macroponent),
                internalComponent: componentsGR.internal_component.toString() === 'true',
                hideInToolbox: !internalComponentVisibilityCheck && componentsGR.internal_component.toString() === 'true',
                componentBuilderMetadataId: this.getComponentBuilderMetadataId(componentId),
                searchFacetData: searchFacetM2M.getSearchFacetsByTargetId(componentId),
                sysScope: {
                    value: componentsGR.sys_scope.toString(),
                    displayValue: componentsGR.sys_scope.getDisplayValue(),
                    scopeName: scopeRecord.scope,
                    vendor: scopeRecord.vendor || BuilderToolkitConstants.SERVICENOW
                }
            });
        }
        return componentDefinitions;
    },
    /**
     * @param macroponetHelper {function}
     * @param macroponentGR {GlideRecord}
     */
    getInternalComponentDefinitions: function(macroponentHelper, macroponentGR) {
        const dependentComponentIds = macroponentHelper.getCompositionMacroponentIds(macroponentHelper.parseJSON(macroponentGR.composition.toString(), {
            field: 'composition',
            sysId: macroponentGR.sys_id.toString()
        }));
        return dependentComponentIds ? this.getComponentDefinitions(dependentComponentIds, true) : [];
    },

    type: 'ComponentDefinitions'
});
