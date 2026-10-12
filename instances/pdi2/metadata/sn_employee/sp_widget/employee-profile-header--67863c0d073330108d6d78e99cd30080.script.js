(function() {

    if (!input) {
        data.defaultBanner = '';
        data.showPresence = false;
        data.sysUserID = $sp.getParameter("sys_id") || gs.getUserID();
        var epUtils = new sn_employee.ep_Utils();
        var epPortalUtils = new sn_employee.ep_portalUtil(data.sysUserID);
        var portal = $sp.getPortalRecord().getUniqueValue();

        var sysUserGR = epUtils.getSysUserRecord(data.sysUserID);
        data.userExists = true;
        if (gs.nil(sysUserGR)) {
            data.userExists = false;
            return;
        }
        var loggedInSysUserID = gs.getUser().getID();
        data.isMyProfile = loggedInSysUserID.equals(data.sysUserID);

        var liveProfile = epPortalUtils.getLiveProfileDetails(data.sysUserID);
        var profilePicture = (liveProfile && liveProfile.getDisplayValue("photo")) ? liveProfile.getDisplayValue("photo") : "";
        profilePicture = profilePicture.substring(0, profilePicture.indexOf('.')) || profilePicture;
        data.defaultBanner = epPortalUtils.getDefaultBackgroundBanner();
        // isValidEmployee() checks for if the user is in profile table and also satisfies the current employee defintion condition.
        data.hasValidEmployeeRecord = epUtils.isValidEmployee(data.sysUserID);
        data.configExists = true;

        if (data.hasValidEmployeeRecord) {
            var headerConfigData = epUtils.getHeaderConfigData(portal);
            if (Object.keys(headerConfigData).length == 0) {
                gs.addInfoMessage(gs.getMessage("No Portal configuration or default Header configuration exists. Please contact your Administrator"))
                data.configExists = false;
                return;
            }
            data.profileDetails = epPortalUtils.getUserProfileDetails(headerConfigData);
            data.profileDetails.profile_picture = profilePicture;
            data.profileDetails.live_profile_id = liveProfile ? liveProfile.getUniqueValue() : "";
            data.showPresence = data.profileDetails.userPresenceInfo.showPresence;
            data.headerConfig = headerConfigData;
        } else {
            data.userDetails = {};
            data.userDetails.name = sysUserGR.getDisplayValue('name');
            data.userDetails.title = sysUserGR.getDisplayValue('title');
            data.userDetails.department = sysUserGR.getDisplayValue('department');
            data.userDetails.profile_picture = profilePicture;
            data.userDetails.initials = (sysUserGR.getDisplayValue('first_name').charAt(0) || '') + (sysUserGR.getDisplayValue('last_name').charAt(0) || '');
            data.showPresence = options.enable_non_employee_user_presence_info;
            data.headerConfig = epUtils.getNonEmployeeHeaderConfigData(portal);
        }

        data.isEditable = gs.getUserID() === data.sysUserID && epUtils.userSatisfiesEmployeeDefintion(data.sysUserID) && data.headerConfig.editImages;

        var isPluginActive = new GlidePluginManager().isActive('sn_now_teams');
        if (isPluginActive) {
            if (data.showPresence) {
                var auth = new sn_tcm_collab_hook.MSTeamsCredentialsHelper();
                if (!auth.isAccessTokenOrRefreshTokenAvailable()) {
                    data.teamsOauthInitiatorURL = auth.getOauthInitiatorURL();
                    data.presenceClass = 'fa fa-info-circle teams-logout';
                    data.teamsOauthInitiatorURL = gs.getProperty('glide.servlet.uri').concat(data.teamsOauthInitiatorURL);
                } else {
                    var presenceUtil = new sn_tcm_collab_hook.MSTeamsChatUtil();
                    var userRecord = [];
                    var user = {
                        id: data.sysUserID,
                        isValidEmail: true //MSTeamsChatUtil added check on this flag as part of DEF0318401
                    };
                    userRecord.push(user);
                    data.presenceResponse = presenceUtil.getPresence(userRecord, 'id', true);
                    data.userChatURL = 'https://teams.microsoft.com/l/chat/0/0?users='.concat(sysUserGR.getValue('email'));

                    if (data.presenceResponse[0].mappedPresence == 'available') {
                        data.presenceClass = 'fa fa-check-circle teams-available';
                        data.mappedPresence = gs.getMessage('Available on Microsoft Teams');
                    } else if (data.presenceResponse[0].mappedPresence == 'busy') {
                        data.presenceClass = 'fa fa-minus-circle teams-busy';
                        data.mappedPresence = gs.getMessage('Busy on Microsoft Teams');
                    } else if (data.presenceResponse[0].mappedPresence == 'away') {
                        data.presenceClass = 'fa fa-minus-circle teams-away';
                        data.mappedPresence = gs.getMessage('Away on Microsoft Teams');
                    } else if (data.presenceResponse[0].mappedPresence == 'offline') {
                        data.presenceClass = 'fa fa-circle-o teams-offline';
                        data.mappedPresence = gs.getMessage('Offline on Microsoft Teams');
                    } else {
                        data.presenceClass = 'fa fa-circle-o teams-offline';
                        data.mappedPresence = gs.getMessage('Unknown on Microsoft Teams');
                    }

                    if (data.mappedPresence && !data.isMyProfile) {
                        data.mappedPresence = data.mappedPresence.concat(' - ');
                    }
                }
            }
        }
        data.actionWidgetData = $sp.getWidget("action-widget", {
            table: 'sys_user',
            context: data.sysUserID,
            action_group: data.headerConfig.actions
        });
    }
	
    if (input) {
        if (input.action == "deleteBanner")
            new sn_employee.ep_portalUtil(input.userID).deleteEmployeeProfileBanner();
        else if (input.action == "deleteProfile")
            new sn_employee.ep_portalUtil(input.userID).deleteEmployeeProfilePicture();
    }

})();
