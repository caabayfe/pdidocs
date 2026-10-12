var TaxonomyPortalUtil = Class.create();
TaxonomyPortalUtil.prototype = Object.extendsObject(TaxonomyPortalUtilSNC, {
    initialize: function() {
        TaxonomyPortalUtilSNC.prototype.initialize.apply(this, arguments);
    },

    type: 'TaxonomyPortalUtil'
});
