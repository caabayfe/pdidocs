const ScreenApplicability = Class.create();
ScreenApplicability.prototype = Object.extendsObject(BuilderToolkitAPIBase, {
    TABLE: 'sys_ux_applicability_m2m_screen',
    FIELDS: [],

    /**
     * @param fields {string[]}
     */
    initialize: function(fields, noDomain, includeDisplayValue) {
        BuilderToolkitAPIBase.prototype.initialize.call(this, this.TABLE, fields || this.FIELDS, noDomain, includeDisplayValue);
    },

    type: 'ScreenApplicability'
});
