var SearchFacetItems = Class.create();
SearchFacetItems.prototype = Object.extendsObject(BuilderToolkitAPIBase, {
    TABLE: 'sys_uib_search_facet_item',
    FIELDS: ['api_name', 'label', 'sys_id', 'order', 'canonical_api_name', 'search_facet'],
    FIELD_TYPE: {
        api_name: 'string',
        label: 'translated_field',
        sys_id: 'string',
        order: 'integer',
        search_facet: 'reference'
    },
    initialize: function(fields, noDomain, includeDisplayValue) {
        BuilderToolkitAPIBase.prototype.initialize.call(this, this.TABLE, fields || this.FIELDS, noDomain, includeDisplayValue, this.FIELD_TYPE);
    },

    type: 'SearchFacetItems'
});
