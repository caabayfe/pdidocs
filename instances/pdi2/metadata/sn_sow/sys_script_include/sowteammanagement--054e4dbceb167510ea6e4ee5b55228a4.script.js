var SOWTeamManagement = Class.create();
SOWTeamManagement.prototype = Object.extendsObject(SOWTeamManagementSNC, {
    initialize: function() {
		SOWTeamManagementSNC.prototype.initialize.apply(this, arguments);
    },
    type: 'SOWTeamManagement'
});
