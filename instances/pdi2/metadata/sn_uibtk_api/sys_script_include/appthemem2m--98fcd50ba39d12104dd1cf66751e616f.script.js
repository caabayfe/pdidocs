const AppThemeM2M = Class.create();
AppThemeM2M.prototype = Object.extendsObject(BuilderToolkitAPIBase, {
    TABLE: 'm2m_app_theme',
    FIELDS: ['ux_app','theme'],

    /**
     * @param fields {string[]}
     */
    initialize: function(fields, noDomain, includeDisplayValue) {
        BuilderToolkitAPIBase.prototype.initialize.call(this, this.TABLE, fields || this.FIELDS, noDomain, includeDisplayValue);
    },

    type: 'AppThemeM2M'
});
