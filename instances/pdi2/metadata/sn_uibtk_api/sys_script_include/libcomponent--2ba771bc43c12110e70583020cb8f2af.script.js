const LibComponent = Class.create();
LibComponent.prototype = Object.extendsObject(BuilderToolkitAPIBase, {
    TABLE: 'sys_ux_lib_component',
    FIELDS: [],

    /**
     * @param fields {string[]}
     */
    initialize: function(fields, table) {
        BuilderToolkitAPIBase.prototype.initialize.call(this, table || this.TABLE, fields || this.FIELDS);
    },

    /**
     * @param sysIds {string} a comma-separated list of sys_ids to query by
     * @param loadMacroponent {boolean} true if we should include the full macroponent in the Definition
     */
    getComponentDefinitions: function(sysIds) {
        const macroponentHandler = new Macroponent();
		const query = `sys_idIN${sysIds}^root_component.sys_class_name=sys_ux_lib_component`;
		const macroponentGRs = macroponentHandler.getRecordsByQuery(query, '', true);
		if(!macroponentGRs){
			return [];
		}

		const componentDefinitions = [];
		while(macroponentGRs.next()){
			const componentDefinition = this.getValuesFromGlideRecord(macroponentGRs.root_component.getRefRecord());
			const macroponentValues = macroponentHandler.getValuesFromGlideRecord(macroponentGRs);
			componentDefinition.name = macroponentValues.name;
			componentDefinition.macroponent = macroponentValues;
			componentDefinition.hideInToolbox = true;
			componentDefinition.isEditable = false;
			componentDefinition.rootComponentTag = componentDefinition.tag;
			componentDefinition.type = "libComponent";
			componentDefinitions.push(componentDefinition);
		}
		return componentDefinitions;
    },

    type: 'LibComponent'
});
