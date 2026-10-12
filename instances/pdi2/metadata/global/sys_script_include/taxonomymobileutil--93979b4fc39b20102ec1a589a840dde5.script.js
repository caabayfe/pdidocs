var TaxonomyMobileUtil = Class.create();
TaxonomyMobileUtil.prototype = Object.extendsObject(TaxonomyMobileUtilSNC, {
    initialize: function() {
        TaxonomyMobileUtilSNC.prototype.initialize.apply(this, arguments);
    },

    type: 'TaxonomyMobileUtil'
});
