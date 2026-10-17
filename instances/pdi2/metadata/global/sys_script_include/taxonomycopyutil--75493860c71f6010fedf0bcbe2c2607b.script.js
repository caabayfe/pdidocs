var TaxonomyCopyUtil = Class.create();
TaxonomyCopyUtil.prototype = Object.extendsObject(TaxonomyCopyUtilSNC, {
    initialize: function() {
        TaxonomyCopyUtilSNC.prototype.initialize.apply(this, arguments);
    },

    type: 'TaxonomyCopyUtil'
});
