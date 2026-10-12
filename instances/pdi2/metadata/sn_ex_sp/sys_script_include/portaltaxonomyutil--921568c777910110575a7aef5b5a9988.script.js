var PortalTaxonomyUtil = Class.create();
PortalTaxonomyUtil.prototype = Object.extendsObject(PortalTaxonomyUtilSNC, {
    initialize: function () {
        PortalTaxonomyUtilSNC.prototype.initialize.apply(this, arguments);
    },
    type: 'PortalTaxonomyUtil'
});
