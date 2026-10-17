var CommunicationManagementUXFChatUtil = Class.create();
CommunicationManagementUXFChatUtil.prototype = Object.extendsObject(CommunicationManagementUXFChatUtilSNC, {
    initialize: function() {
        CommunicationManagementUXFChatUtilSNC.prototype.initialize.call(this);
    },

    type: 'CommunicationManagementUXFChatUtil'
});
