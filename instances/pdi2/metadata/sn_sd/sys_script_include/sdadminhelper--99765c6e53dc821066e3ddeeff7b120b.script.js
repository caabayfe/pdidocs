var SDAdminHelper = Class.create();
SDAdminHelper.prototype = Object.extendsObject(SDAdminHelperSNC, {
    initialize: function() {
        SDAdminHelperSNC.prototype.initialize.call(this);
    },

    type: 'SDAdminHelper'
});
