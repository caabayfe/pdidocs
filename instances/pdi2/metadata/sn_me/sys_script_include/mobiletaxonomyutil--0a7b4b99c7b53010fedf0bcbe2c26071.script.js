var MobileTaxonomyUtil = Class.create();
MobileTaxonomyUtil.prototype = Object.extendsObject(MobileTaxonomyUtilSNC, {
    initialize: function() {
        MobileTaxonomyUtilSNC.prototype.initialize.apply(this, arguments);
    },

    type: 'MobileTaxonomyUtil'
});
