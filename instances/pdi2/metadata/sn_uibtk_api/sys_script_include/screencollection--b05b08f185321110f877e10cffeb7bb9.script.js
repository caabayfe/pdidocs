const ScreenCollection = Class.create();
ScreenCollection.prototype = Object.extendsObject(BuilderToolkitAPIBase, {
    TABLE: 'sys_ux_screen_type',
    FIELDS: [],
    FIELD_TYPES: {
        name: 'translated_field',
        description: 'translated_text'
    },

    /**
     * @param fields {string[]}
     */
    initialize: function(fields, noDomain, includeDisplayValue) {
        BuilderToolkitAPIBase.prototype.initialize.call(this, this.TABLE, fields || this.FIELDS, noDomain, includeDisplayValue, this.FIELD_TYPES);
    },

    getRoutes: function(screenTypeId) {
        const appRouteHandler = new AppRoute(false, this.noDomain, this.includeDisplayValue);
        const screenCollection = this.getRecordById(screenTypeId);
        if (screenCollection) {
            return {
                ...screenCollection,
                routes: appRouteHandler.getRoutes(`screen_type=${screenTypeId}`)
            };
        }
        return {};
    },

    type: 'ScreenCollection'
});
