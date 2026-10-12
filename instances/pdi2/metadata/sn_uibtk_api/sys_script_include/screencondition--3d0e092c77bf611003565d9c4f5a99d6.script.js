const ScreenCondition = Class.create();
ScreenCondition.prototype = Object.extendsObject(BuilderToolkitAPIBase, {
    TABLE: 'sys_ux_screen_condition',
    FIELDS: ['screen_condition', 'active', 'sys_name', 'is_result_memoizable', 'conditions_params_mapping', 'script', 'scripted_condition'],
    FIELD_TYPES: {
        screen_condition: 'string',
        active: 'boolean',
        is_result_memoizable: 'boolean',
        conditions_params_mapping: 'json',
        script: 'string',
        scripted_condition: 'boolean',
    },

    /**
     * @param fields {string[]}
     */
    initialize: function(fields, noDomain, includeDisplayValue) {
        BuilderToolkitAPIBase.prototype.initialize.call(this, this.TABLE, fields || this.FIELDS, noDomain, includeDisplayValue);
    },

    type: 'ScreenCondition'
});
