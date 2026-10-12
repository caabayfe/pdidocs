const AppConfig = Class.create();
AppConfig.prototype = Object.extendsObject(BuilderToolkitAPIBase, {
    TABLE: 'sys_ux_app_config',
    FIELDS: ['name', 'landing_path', 'description'],
    FIELD_TYPE: {
        name: 'translated_field',
        landing_path: 'string'
    },

    /**
     * @param fields {string[]}
     */
    initialize: function(fields, noDomain, includeDisplayValue) {
        BuilderToolkitAPIBase.prototype.initialize.call(this, this.TABLE, fields || this.FIELDS, noDomain, includeDisplayValue, this.FIELD_TYPE);
    },

    /**
     * @param sysId {string} the sysId of the appConfig being loaded 
     */
	  getAppConfigById: function (sysId) {
        let appConfig = this.getRecordById(sysId);
        return appConfig;
	  },

    type: 'AppConfig'
});
