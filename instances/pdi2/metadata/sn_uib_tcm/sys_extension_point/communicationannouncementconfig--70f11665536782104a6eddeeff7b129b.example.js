var CommunicationAnnouncementConfig = Class.create();
CommunicationAnnouncementConfig.prototype = {
    initialize: function() {},

    getTableName: function() {
        return '';
    },

    isManageAnnouncementsSupported: function(table, sysId) {
        return false;
    },

    type: 'CommunicationAnnouncementConfig'
};
