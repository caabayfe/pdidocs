var QuickLinkUtil = Class.create();
QuickLinkUtil.prototype = Object.extendsObject(QuickLinkUtilSNC, {
    initialize: function() {
        QuickLinkUtilSNC.prototype.initialize.apply(this, arguments);
    },

    type: 'QuickLinkUtil'
});
