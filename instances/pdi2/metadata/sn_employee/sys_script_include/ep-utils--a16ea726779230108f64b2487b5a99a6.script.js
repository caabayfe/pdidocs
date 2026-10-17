var ep_Utils = Class.create();
ep_Utils.prototype = Object.extendsObject(ep_UtilsSNC, {

    initialize: function() {
        ep_UtilsSNC.prototype.initialize.apply(this, arguments);
    },

    type: 'ep_Utils'
});
