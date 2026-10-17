var ExternalLinkUtil = Class.create();
ExternalLinkUtil.prototype = Object.extendsObject(ExternalLinkUtilSNC, {
    initialize: function() {
        ExternalLinkUtilSNC.prototype.initialize.apply(this, arguments);
    },

    type: 'ExternalLinkUtil'
});
