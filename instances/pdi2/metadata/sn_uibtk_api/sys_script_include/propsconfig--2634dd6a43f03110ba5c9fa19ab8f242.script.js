const PropsConfig = Class.create();
PropsConfig.prototype = Object.extendsObject(BuilderToolkitAPIBase, {
    TABLE: 'sn_ui_builder_props_config',
    FIELDS: ['config_layout', 'name', 'scripted_config_policy', 'target'],
    /**
     * @param fields {string[]}
     */
    initialize: function(fields) {
        BuilderToolkitAPIBase.prototype.initialize.call(this, this.TABLE, fields || this.FIELDS);
    },

    addPropConfigToResponse: function(recordGRs, targetTable) {
        if (Array.isArray(recordGRs)) {
            const recordIdArray = recordGRs.map(({
                sysId
            }) => sysId);
            const propConfigEncodedQuery = `target_table=${targetTable}^targetIN${recordIdArray.join(',')}^active=true`;
            const propConfigGR = this.getRecordsByQuery(propConfigEncodedQuery, 'name');
            return recordGRs.map((recordGR) => {
                const propsConfig = propConfigGR && propConfigGR.length !== 0 ? propConfigGR.find(({
                    target
                }) => target === recordGR.sysId) : null;
                return {
                    ...recordGR,
                    propsConfig
                };
            });
        }
        return recordGRs;
    },
    type: 'PropsConfig'
});
