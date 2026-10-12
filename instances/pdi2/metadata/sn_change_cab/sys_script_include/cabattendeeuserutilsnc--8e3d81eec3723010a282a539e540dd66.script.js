var CABAttendeeUserUtilSNC = Class.create();

CABAttendeeUserUtilSNC.prototype = {
	initialize: function(_userGr, _userGroupGr) {
		this._userGr = _userGr;
		this._userGroupGr = _userGroupGr;
	},

	_getUserId: function() {
		if (!this._userGr)
			return '';

		return typeof this._userGr === "string" ? this._userGr : this._userGr.getUniqueValue();
	},

	_getUserGroupId: function() {
		if (!this._userGroupGr)
			return '';

		return typeof this._userGroupGr === "string" ? this._userGroupGr : this._userGroupGr.getUniqueValue();
	},

	processUserAddedToBoardGroup: function() {
		if (!this._getUserId() || !this._getUserGroupId())
			return;

		var userMemberGr = new GlideRecord('sys_user_grmember');
		userMemberGr.addQuery('user', this._getUserId());
		userMemberGr.addQuery('group', this._getUserGroupId());
		userMemberGr.query();

		if (userMemberGr.next())
			this._processGroupUserUpdated('insert');
	},

	processUserRemovedFromBoardGroup: function() {
		if (!this._getUserId() || !this._getUserGroupId())
			return;

		var userMemberGr = new GlideRecord('sys_user_grmember');
		userMemberGr.addQuery('user', this._getUserId());
		userMemberGr.addQuery('group', this._getUserGroupId());
		userMemberGr.query();

		if (!userMemberGr.next())
			this._processGroupUserUpdated('delete');
	},

	_processGroupUserUpdated: function(operation) {
		if (!this._getUserGroupId())
			return;

		var groupGr = new GlideRecord('sys_user_group');
		groupGr.addActiveQuery();
		groupGr.addQuery('sys_id', this._getUserGroupId());
		groupGr.query();

		if (groupGr.next()) {
			var cabMeetingGr = new GlideRecord('cab_meeting');
			cabMeetingGr.addActiveQuery();
			cabMeetingGr.addQuery('board_groups', 'CONTAINS', this._getUserGroupId());
			cabMeetingGr.addQuery('state', 'IN', gs.getProperty('sn_change_cab.com.snc.change_management.cab.refresh_group_attendees.meeting_state', 'pending').trim().split(','));
			cabMeetingGr.addQuery("start", ">=", new GlideDateTime());
			cabMeetingGr.query();
			while (cabMeetingGr.next()) {
				var cabMeeting = new CABMeeting(cabMeetingGr);
				if (operation === 'insert')
					cabMeeting.addBoardGroupMember(this._getUserGroupId(), this._getUserId());
				else if (operation === 'delete')
					cabMeeting.removeBoardGroupMember(this._getUserGroupId(), this._getUserId());
			}
		}
	},

	type: 'CABAttendeeUserUtilSNC'
};
