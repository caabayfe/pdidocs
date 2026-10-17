const App = Class.create();
App.prototype = Object.extendsObject(BuilderToolkitAPIBase, {
    TABLE: 'sys_ux_app',
    FIELDS: ['theme','name'],

    /**
     * @param fields {string[]}
     */
    initialize: function(fields, noDomain, includeDisplayValue) {
        BuilderToolkitAPIBase.prototype.initialize.call(this, this.TABLE, fields || this.FIELDS, noDomain, includeDisplayValue);
    },

    type: 'App'
});
