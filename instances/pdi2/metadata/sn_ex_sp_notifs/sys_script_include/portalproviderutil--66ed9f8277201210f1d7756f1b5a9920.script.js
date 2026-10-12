var PortalProviderUtil = Class.create();
PortalProviderUtil.prototype = Object.extendsObject(PortalProviderUtilSNC, {
    initialize: function() {
        PortalProviderUtilSNC.prototype.initialize.apply(this, arguments);
    },

    type: 'PortalProviderUtil'
});
