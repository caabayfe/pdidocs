const Icon = Class.create();
Icon.prototype = Object.extendsObject(BuilderToolkitAPIBase, {
    TABLE: 'st_sys_design_system_icon',
    FIELDS: ['name', 'label'],

    /**
     * @param fields {string[]}
     */
    initialize: function(fields) {
        BuilderToolkitAPIBase.prototype.initialize.call(this, this.TABLE, fields || this.FIELDS);
    },

    type: 'Icon'
});
