(function() {
		if (input && input.action === "update_session_tracking_info") {
		gs.getSession().putProperty("usage_tracking_allowed_for_session", input.user_tracking);
		return;
		
	}

	// populate the 'data' object
	// e.g., data.table = $sp.getValue('table');
	data.sysUserID = $sp.getParameter("sys_id");
	if (!data.sysUserID)
			data.sysUserID = gs.getUser().getID();
	if (!GlideStringUtil.isEligibleSysID(data.sysUserID)) {
		data.sysUserID = '';
		data.userExists = false;
		return;
	}
	var sysUserGR = new GlideRecord("sys_user");
	data.userExists = sysUserGR.get(data.sysUserID) && sysUserGR.canRead();

	if (data.userExists) {
		sysUserGR = GlideScriptRecordUtil.get(sysUserGR).getRealRecord();
		data.table = sysUserGR.getRecordClassName();
		data.name = sysUserGR.getValue("name");
		var loggedInSysUserID = gs.getUser().getID();
		data.connectEnabled = GlidePluginManager().isActive('com.glide.connect') && gs.getProperty('glide.connect.chat.disabled') !== 'true';
		if (data.sysUserID === loggedInSysUserID)
			data.liveProfileID = new GlideappLiveProfile().getID();
		else
			data.liveProfileID = "";
		data.dateTimeFormat = gs.getDateTimeFormat();

		//get live profile id for sending connect messages
		if (GlidePluginManager().isActive('com.glideapp.live_common')) {
			var liveProfileGR = new GlideRecord("live_profile");
			if (data.sysUserID === loggedInSysUserID)
				liveProfileGR.addQuery("sys_id", data.liveProfileID);
			else
				liveProfileGR.addQuery("document", data.sysUserID);
			liveProfileGR.query();
			if (liveProfileGR.next()) {
				data.liveProfileID = liveProfileGR.getValue("sys_id");
				data.liveProfileModel = $sp.getForm("live_profile", data.liveProfileID)._fields;
				// live_profile short_description is shown here as "Bio", so popup label/hint must reflect that
				if (data.liveProfileModel.short_description) {
					data.liveProfileModel.short_description.label = gs.getMessage("Bio");
					data.liveProfileModel.short_description.hint = gs.getMessage("Biography");
				}
			} else
				data.connectEnabled = false; //can't find a live profile for this user, so lets not integrate Connect
		}

		data.isLoggedInUsersProfile = loggedInSysUserID.equals(data.sysUserID);
		var sysUserForm = $sp.getForm(data.table, data.sysUserID);
		data.sysUserView = sysUserForm._view;
		data.sysUserModel = sysUserForm._fields;
		data.sysUserModelList = [];

		for (var i = 0; i < data.sysUserView.length; i++) {
			data.sysUserModelList.push(data.sysUserModel[data.sysUserView[i].name]);
		}

		data.directReports = [];
		data.teamData = {};
		data.teamData.direct_reports = [];
		data.teamData.members = [];

		if (!data.isLoggedInUsersProfile) {
			data.teamData.user = {
				sys_id: data.sysUserID
			}
		}

		//Calculate manager
		var managerGR = new GlideRecord("sys_user");
		if (managerGR.get(sysUserGR.getValue("manager"))) {
			data.teamData.manager = buildUser(managerGR);
		}

		//Calculate team
		if (data.teamData.manager) {
			var teamGR = new GlideRecord("sys_user");
			teamGR.addActiveQuery();
			teamGR.orderBy("name");
			teamGR.addQuery("manager", data.teamData.manager.sys_id);
			teamGR.addQuery("sys_id", "!=", data.sysUserID);
			teamGR.query();
			while(teamGR.next())
				data.teamData.members.push(buildUser(teamGR));
		}

		//Calculate direct reports
		var directReportGR = new GlideRecordSecure("sys_user");
		directReportGR.addActiveQuery();
		directReportGR.orderBy("name");
		directReportGR.addQuery("manager", data.sysUserID);
		directReportGR.query();

		while(directReportGR.next())
			data.teamData.direct_reports.push(buildUser(directReportGR));

		data.teamWidget = $sp.getWidget('sp-my-team', {glyph: 'user', color: 'primary', show_current_user: options.show_current_user});
		if(!input)
			data.userPreferencesWidget = $sp.getWidget('user-preferences', {glyph: 'user', color: 'primary'});

		}

	function buildUser(userGR) {
		return {
			email: userGR.getValue("email") || "",
			first_name: userGR.getValue("first_name"),
			last_name: userGR.getValue("last_name"),
			name: userGR.getValue("name"),
			phone: userGR.getValue("phone") || "",
			sys_id: userGR.getValue("sys_id")
		}
	}

	if (!data.userExists)
		data.sysUserID = '';
	})();
