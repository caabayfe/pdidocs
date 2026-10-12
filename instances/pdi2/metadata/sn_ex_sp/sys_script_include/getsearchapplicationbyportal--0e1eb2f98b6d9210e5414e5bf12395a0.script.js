var GetSearchApplicationByPortal = Class.create();
GetSearchApplicationByPortal.prototype = Object.extendsObject(GetSearchApplicationByPortalSNC, {
    initialize: function () {
        GetSearchApplicationByPortalSNC.prototype.initialize.apply(this, arguments);
    },

    type: 'GetSearchApplicationByPortal'
    });
