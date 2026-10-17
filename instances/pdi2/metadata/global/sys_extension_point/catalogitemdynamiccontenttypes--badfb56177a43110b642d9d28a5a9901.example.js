var CatalogItemDynamicContentTypes = Class.create();

CatalogItemDynamicContentTypes.prototype = {

    initialize: function() {},

    MODEL_ID: '',

    /* returns the url of the dynamic content item */
    getURL: function(content, uiType) {
        return '';
    },

    /* returns true if the content is accessible to user*/
    canView: function(content) {
        return true;
    },

    /* returns the portal configuration for dynamic item */
    getServicePortalConfig: function(content) {
        return {};
    },

    type: 'CatalogItemDynamicContentTypes'
};
