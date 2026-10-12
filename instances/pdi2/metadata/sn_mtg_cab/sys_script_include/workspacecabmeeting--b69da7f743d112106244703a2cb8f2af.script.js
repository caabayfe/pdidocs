var WorkspaceCABMeeting = Class.create();

WorkspaceCABMeeting.get = WorkspaceCABMeetingSNC.get;

WorkspaceCABMeeting.prototype = Object.extendsObject(WorkspaceCABMeetingSNC, {
	initialize: function() {
		WorkspaceCABMeetingSNC.prototype.initialize.apply(this, arguments);
	},

    type: 'WorkspaceCABMeeting'
});
