const UXAddOnEventMapping = Class.create();
UXAddOnEventMapping.prototype = Object.extendsObject(BuilderToolkitAPIBase, {
    TABLE: 'sys_ux_addon_event_mapping',
    FIELDS: ['name', 'description', 'source_element_id', 'parent_macroponent', 'target_event', 'target_payload_mapping', 'source_da'],
    FIELD_TYPES: {
        name: 'string',
        description: 'string',
        source_element_id: 'string',
        parent_macroponent: 'string',
        target_event: 'reference',
        target_payload_mapping: 'json',
        source_da: 'reference'
    },

    /**
     * @param fields {string[]}
     * @param noDomain {boolean}
     */
    initialize: function(fields, noDomain) {
        BuilderToolkitAPIBase.prototype.initialize.call(this, this.TABLE, fields || this.FIELDS, noDomain, undefined, this.FIELD_TYPES);
    },

    type: 'UXAddOnEventMapping'
});
