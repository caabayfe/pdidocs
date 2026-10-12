const ScreenTypeConditionScript = Class.create();
ScreenTypeConditionScript.prototype = Object.extendsObject(BuilderToolkitAPIBase, {
    TABLE: 'sys_ux_screen_type_condition_script',
    FIELDS: ['screen_type', 'namespace_key', 'object_keys', 'active', 'script','name','description'],

    /**
     * @param fields {string[]}
     */
    initialize: function(fields, noDomain, includeDisplayValue) {
        BuilderToolkitAPIBase.prototype.initialize.call(this, this.TABLE, fields || this.FIELDS, noDomain, includeDisplayValue);
    },

    type: 'ScreenTypeConditionScript'
});
