var ep_portalUtil = Class.create();
ep_portalUtil.prototype = Object.extendsObject(ep_portalUtilSNC, {
    initialize: function() {
        ep_portalUtilSNC.prototype.initialize.apply(this, arguments);
    },

    type: 'ep_portalUtil'
});
