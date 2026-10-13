var CommunicationManagementUXFBaseUtil = Class.create();
CommunicationManagementUXFBaseUtil.prototype = Object.extendsObject(CommunicationManagementUXFBaseUtilSNC, {
    initialize: function() {
        CommunicationManagementUXFBaseUtilSNC.prototype.initialize.call(this);
    },

    type: 'CommunicationManagementUXFBaseUtil'
});
