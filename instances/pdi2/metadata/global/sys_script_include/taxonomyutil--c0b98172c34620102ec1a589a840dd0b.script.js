var TaxonomyUtil = Class.create();
TaxonomyUtil.prototype = Object.extendsObject(TaxonomyUtilSNC, {
    initialize: function () {
        TaxonomyUtilSNC.prototype.initialize.apply(this, arguments);
    },

    type: 'TaxonomyUtil'
});
