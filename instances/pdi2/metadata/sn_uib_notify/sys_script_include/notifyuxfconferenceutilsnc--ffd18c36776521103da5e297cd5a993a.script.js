var NotifyUXFConferenceUtilSNC = Class.create();
NotifyUXFConferenceUtilSNC.prototype = {
    initialize: function() {
        this.confUtils = new global.NotifyConferenceUtils();
        this.notifyUtil = new global.NotifyUtil();
        this.notifyUxfUtil = new NotifyUXFUtil();
    },
    TELEPHONY_PROVIDER: "Telephony",
    CONFERENCE_PROVIDER: "Conference",
    CONFERENCE_PROVIDER_DISPLAY_VALUE: gs.getMessage("Conference"),
    NOTIFY_UIB_VISIBILITY_HANDLER: "sn_uib_notify.NotifyUIBVisibility",
    ACTIVE_PARTICIPANTS_POLLING_INTERVAL: "sn_uib_notify.active_participants.polling.interval",
    MAX_PARTICIPANTS_FETCH_LIMIT: "sn_uib_notify.max_participants_notify_uib",
    MAX_CONFERENCE_CALLS_FETCH_LIMIT: "sn_uib_notify.max_conference_calls_notify_uib",
    DEFAULT_SP_NAME_ICON_MAP: {
        "Telephony": "phone-outline",
        "Conference": "user-group-outline"
    },
    DEFAULT_ICONS_MAP: {
        "UnknownUser": "circle-user-fill"
    },
    SP_NAME_ICON_MAP: {
        "Telephony": "twilio-outline",
        "Zoom": "zoom-outline",
        "Microsoft Teams": "microsoft-teams-outline"
    },
    TABLE: {
        SYS_USER: "sys_user",
        SYS_USER_GROUP: "sys_user_group",
        NOTIFY_PARTICIPANT: "notify_participant",
        NOTIFY_PARTICIPANT_SESSION: "notify_participant_session",
        NOTIFY_CONFERENCE_CALL: "notify_conference_call",
        NOTIFY_RECORDING: "notify_recording",
        NOTIFY_NUMBER: "notify_number",
        NOTIFY_TRANSCRIPT_SUMMARY: "notify_transcript_summary"
    },
    FIELD: {
        USER_NAME: "user_name",
        USER: "user",
        NAME: "name",
        NOTIFY_CONFERENCE_CALL: "notify_conference_call",
        SYS_ID: "sys_id",
        ACTIVE: "active",
        SERVICE_PROVIDER: "service_provider",
        NOTIFY_NUMBER: "notify_number",
        SYS_CREATED_BY: "sys_created_by",
        CODE: "code",
        SERVICE_PROVIDER_DATA: "service_provider_data",
        SYS_CREATED_ON: "sys_created_on",
        SYS_UPDATED_ON: "sys_updated_on",
        LAST_ACTIVE_ON: "last_active_on",
        DURATION: "duration",
        CONFERENCE_TITLE: "conference_title",
        DESCRIPTION: "description",
        URL: "url",
        EMAIL: "email",
        PHONE_NUMBER: "phone_number",
        NUMBER: "number",
        NOTIFY_PARTICIPANT: "notify_participant",
        TABLE: "table",
        SOURCE: "source",
        PROVIDER_SUMMARY: "provider_summary",
        TRANSCRIPT_ID: "transcript_id",
        SYS_ATTACHMENT: "sys_attachment",
        CONFERENCE_CALL_ID: "conference_call_id"
    },
    CONFERENCE_CALL_TYPE_INDEX: {
        ACTIVE: 0,
        UPCOMING: 1,
        COMPLETED: 2
    },
    POLLING_INTERVAL: {
        DEFAULT: 15000,
        MIN: 5000
    },
    FIRST_N_PARTICIPANTS_ON_CARD: {
        AVATAR: 5,
        TOOLTIP: 25,
    },
    ACTIONS: {
        MUTE: 'mute',
        UNMUTE: 'unmute',
        KICK: 'kick',
        START: 'start',
        MULTI_MUTE: 'multiMute'
    },
    getCallTemplate: function() {
        return {
            callID: null,
            conferenceCallNumber: {
                value: null,
                displayValue: null
            },
            source: {
                table: null,
                sysId: null
            },
            startTime: null,
            startTimeEpoch: null,
            lastUpdatedTimeEpoch: null,
            callDuration: null,
            duration: null,
            sp: {
                displayName: "",
                name: "",
                icon: null
            },
            title: {
                original: "",
                html: ""
            },
            organiser: {
                userName: "",
                displayName: ""
            },
            canLoggedInUserLeaveCall: false,
            canLoggedInUserEndCall: false,
            canLoggedInUserReinitiateCall: false,
            canLoggedInUserAddParticipants: false,
            canLoggedInUserMute: false,
            canLoggedInUserUnmute: false,
            canLoggedInUserMultiMute: false,
            canLoggedInUserKickOthers: false,
            isLoggedInUserActiveParticipant: false,
            active: false,
            activeParticipants: this.getActiveParticipantsTemplate(),
            loggedInUserNotifyParticipantID: null,
            disableJoinConference: false,
            disableLeaveCallButton: false,
            invite: null,
            message: "",
            number: "",
            recordingLink: null,
            isSummaryAvailable: false,
            isTranscriptAvailable: false
        };
    },
    getActiveParticipantsTemplate: function() {
        return {
            count: 0,
            participants: [],
            firstNTooltipParticipants: [],
            totalActiveParticipants: [],
            displayMessage: ""
        };
    },
    _getConferenceMessages: function() {
        return {
            "Please select a provider to start the meeting.": gs.getMessage("Please select a provider to start the meeting."),
            "Atleast one participant should be added to start the meeting.": gs.getMessage("Atleast one participant should be added to start the meeting."),
            "Atleast one participant should be added.": gs.getMessage("Atleast one participant should be added."),
            "Atleast one recipient should be added to send an SMS.": gs.getMessage("Atleast one recipient should be added to send an SMS."),
            "Please provide a title to start the meeting.": gs.getMessage("Please provide a title to start the meeting."),
            "Notify is not properly configured. Please contact your system administrator": gs.getMessage("Notify is not properly configured. Please contact your system administrator"),
            "No conference call to add participant to.": gs.getMessage("No conference call to add participant to."),
            "As per the configurations, you do not have access to this page. Please contact the system administrator": gs.getMessage("As per the configurations, you do not have access to this page. Please contact the system administrator"),
            "Include a brief message for participants": gs.getMessage("Include a brief message for participants"),
            "Provide a brief description, this note will be stored in the conference record.": gs.getMessage("Provide a brief description, this note will be stored in the conference record."),
            "Please enter a text message to be sent.": gs.getMessage("Please enter a text message to be sent."),
            "Message to be included for participants.": gs.getMessage("Message to be included for participants."),
            "Add the required members you want to send an SMS to. Recommendations could be used to quickly add participants.": gs.getMessage("Add the required members you want to send an SMS to. Recommendations could be used to quickly add participants."),
            "Add the required members you want to connect with on call. Recommendations could be used to quickly add participants.": gs.getMessage("Add the required members you want to connect with on call. Recommendations could be used to quickly add participants."),
            "Select the conference bridge provider through which you want to send an SMS. Telephony providers if configured are displayed as numbers.": gs.getMessage("Select the conference bridge provider through which you want to send an SMS. Telephony providers if configured are displayed as numbers."),
            "Select the conference bridge provider through which you want to initiate the call. Telephony providers if configured are displayed as numbers.": gs.getMessage("Select the conference bridge provider through which you want to initiate the call. Telephony providers if configured are displayed as numbers."),
            "{0} could not be added as the selected participant is invalid. Hence removed from the list.": gs.getMessage("{0} could not be added as the selected participant is invalid. Hence removed from the list."),
            "The group {0} that you have selected does not have any users. Please select another group.": gs.getMessage("The group {0} that you have selected does not have any users. Please select another group."),
            "{0} in Group {1} could not be added as the selected participant is invalid": gs.getMessage("{0} in Group {1} could not be added as the selected participant is invalid"),
            "{0} could not be added as the selected participant is invalid": gs.getMessage("{0} could not be added as the selected participant is invalid"),
            "{0} is already in the conference call": gs.getMessage("{0} is already in the conference call"),
            "No text message to send": gs.getMessage("No text message to send"),
            "Recommendations (Recipient recommendations to add for sending SMS)": gs.getMessage("Recommendations (Recipient recommendations to add for sending SMS)"),
            "Recommendations (Participant recommendations to add to the conference)": gs.getMessage("Recommendations (Participant recommendations to add to the conference)")
        };
    },
    getConferenceInitialResultTemplate: function() {
        return {
            conferenceTitle: "",
            serviceProviderCaps: {},
            isNotifyConferenceConfiguredProperly: false,
            showPage: true,
            defaultServiceProvider: null,
            serviceProviders: [],
            notifyTemplate: {},
            conferenceMessages: this._getConferenceMessages(),
            supportsEventActionsAndIdentifiers: false,
            confDriverActions: {},
            asyncFallbackActions: {},
            hasAsyncSupport: false
        };
    },
    getConferenceCardsDataTemplate: function() {
        return {
            calls: [{
                    // Active calls
                    callRecords: [],
                    callStatus: "",
                    callLabel: "active",
                    expanded: true,
                    slot: false,
                    collapseIcon: null
                },
                {
                    // Upcoming calls
                    callRecords: [],
                    callStatus: "",
                    callLabel: "pending",
                    expanded: true,
                    slot: true,
                    collapseIcon: null
                },
                {
                    // Completed calls
                    callRecords: [],
                    callStatus: "",
                    callLabel: "completed",
                    expanded: true,
                    slot: false,
                    collapseIcon: null
                }
            ],
            loggedInUserActiveParticipantSessionsPerCall: {},
            pollingInterval: this.getPollingInterval(),
            conferenceTemplate: this.confUtils.getConferenceInputDataTemplate(),
            conferenceCallTypeIndex: this.CONFERENCE_CALL_TYPE_INDEX,
            serviceProviderCaps: {}
        };
    },
    getOrderedListOfNotifyNumbersAndProviders: function(table, sysId) {
        return this.notifyUtil.getOrderedListOfNotifyNumbersAndProviders(table, sysId);
    },
    /**
     * @param {Object<string>|any} data
     * 
     * Required - data.table, data.sysId, data.type
     */
    getInitialConferenceDialogDetails: function(data) {
        // Get template data and populate the data
        var conferenceInputTemplate = this.confUtils.getConferenceInputDataTemplate();
        var stdOut = this.getConferenceInitialResultTemplate();
        conferenceInputTemplate.table = data.table;
        conferenceInputTemplate.sysId = data.sysId;
        if (data.conferenceId)
            conferenceInputTemplate.confId = data.conferenceId;
        //Populate the conference title
        var conferenceTitle = this.notifyUtil.getConferenceTitle(conferenceInputTemplate);
        //Get service provider capabilities
        var serviceProviderCaps = {};
        var serviceProviderDetails = this.confUtils.getServiceProviderDetails();
        if (serviceProviderDetails && serviceProviderDetails.caps) {
            serviceProviderCaps = serviceProviderDetails.caps;
        }
        var isNotifyConferenceConfiguredProperly = this.confUtils.hasFullyConfiguredConferenceAvailable();
        if (!isNotifyConferenceConfiguredProperly) {
            stdOut.isNotifyConferenceConfiguredProperly = false;
            return stdOut;
        }
        //Show page based upon leader
        var showPage = false;
        var gr;
        if (data.table && data.sysId) {
            gr = new GlideRecord(data.table);
            if (gr.get(data.sysId))
                showPage = this.notifyUtil.isConferenceLeader(gr);
        }
        if (data.type == "addParticipants") {
            gr = new GlideRecord(this.TABLE.NOTIFY_CONFERENCE_CALL);
            if (data.conferenceId && gr.get(data.conferenceId)) {
                showPage = this.confUtils.canJoinFromConfGR(gr);
                stdOut.defaultServiceProvider = (gr.service_provider + '').trim();
            }
        }
        //Get the numbers and providers details
        var notifyNumbersAndProviders = this.notifyUtil.getOrderedListOfNotifyNumbersAndProviders(data.table, data.sysId);
        var orderedNumbersAndProviders = notifyNumbersAndProviders.orderedNumbersAndProviders;
        //Transform to UIB specific data
        var serviceProviders = [];
        for (var key in orderedNumbersAndProviders) {
            var obj = {};
            for (var providerProps in orderedNumbersAndProviders[key]) {
                obj[providerProps] = orderedNumbersAndProviders[key][providerProps];
            }

            //Add aditonal Props as per UIB Needs
            obj.id = orderedNumbersAndProviders[key].name;
            //Overriding label value to support UIB component
            obj.label = orderedNumbersAndProviders[key].name + "";
            if (orderedNumbersAndProviders[key].type == "number") {
                obj.provider = this.TELEPHONY_PROVIDER;
            } else {
                obj.provider = orderedNumbersAndProviders[key].name + "";
            }
            if (!orderedNumbersAndProviders[key].number) {
                obj.number = "";
            }
            serviceProviders.push(obj);
        }
        //Get confDriver uxf actions
        var confDriverEventActions = this.getConfDriverEventActionsAndIdentifiers();
        stdOut.supportsEventActionsAndIdentifiers = confDriverEventActions.supportsEventActionsAndIdentifiers;
        stdOut.confDriverActions = confDriverEventActions.confDriverActions;
        stdOut.conferenceTitle = conferenceTitle;
        stdOut.serviceProviderCaps = serviceProviderCaps;
        stdOut.isNotifyConferenceConfiguredProperly = isNotifyConferenceConfiguredProperly;
        stdOut.showPage = showPage;
        stdOut.serviceProviders = serviceProviders;
        stdOut.notifyTemplate = conferenceInputTemplate;
        if (data.type == "sendSms")
            stdOut.smsMaxLength = gs.getProperty("glide.notify.sms.max_characters", 1600);

        //Add addtional async fallback actions
        if (this.confUtils.getAsyncFallbackActions && typeof this.confUtils.getAsyncFallbackActions == "function") {
            stdOut.asyncFallbackActions = this.confUtils.getAsyncFallbackActions();
            stdOut.hasAsyncSupport = true;
        }
        return stdOut;
    },
    getConfDriverEventActionsAndIdentifiers: function() {
        var confDriverEventActionsAndIdentifiers = {
            supportsEventActionsAndIdentifiers: false,
            confDriverActions: {}
        };
        if (this.confUtils.getActionsAndIdentifiers && typeof this.confUtils.getActionsAndIdentifiers == "function") {
            confDriverEventActionsAndIdentifiers.supportsEventActionsAndIdentifiers = true;
            confDriverEventActionsAndIdentifiers.confDriverActions = this.confUtils.getActionsAndIdentifiers();
            confDriverEventActionsAndIdentifiers.confDriverActions.actions = this.notifyUxfUtil.getSanitizedEventActions(confDriverEventActionsAndIdentifiers.confDriverActions.actions);
        }
        return confDriverEventActionsAndIdentifiers;
    },
    _getUserDetails: function(userId, dataFromRecommendedParticipant) {
        if (!userId) return;
        var userGr = new GlideRecord(this.TABLE.SYS_USER);
        var obj = {};
        if (userGr.get(userId)) {
            obj.id = dataFromRecommendedParticipant.id;
            obj.label = dataFromRecommendedParticipant.name;
            obj.phoneNumber = dataFromRecommendedParticipant.phoneNumber ? dataFromRecommendedParticipant.phoneNumber : "";
            obj.isLoggedIn = gs.getUserID() == dataFromRecommendedParticipant.id;
            obj.avatarProps = {
                userName: obj.label,
                imageSrc: userGr.getValue("avatar", "") ? userGr.getValue("avatar", "") + ".iix?t=small" : ""
            };
            //obj.email = userGr.get('email');
            obj.email = dataFromRecommendedParticipant.email ? dataFromRecommendedParticipant.email : "";
            obj.name = obj.label;
        }
        return obj;
    },
    /**
     * @param {Object<string>|any} data
     * 
     * Required - data.table, data.sysId, data.type
     */
    getRecommendations: function(data) {
        var filteredRecommendedParticipants = [];
        var numberType = this.notifyUtil.numberType.voice;
        if (data.type && data.type == "sendSms") {
            numberType = this.notifyUtil.numberType.sms;
        }
        //Get recommended Participants
        var inputData = {
            table: data.table,
            sysId: data.sysId,
            numbersType: numberType,
            confId: ""
        };
        if (data.type && data.type == "addParticipants") {
            if (!data.conferenceId) {
                return [];
            }
            inputData.confId = data.conferenceId;
        }
        try {
            var notifyAjaxProcessor = new global.NotifyOnTaskAjaxProcessor_V2(undefined, undefined, undefined, inputData);
            var recommendedParticipants = notifyAjaxProcessor.getRecommendedParticipants();
            var recommendedParticipantsJson = JSON.parse(recommendedParticipants);
            //Get UIB reqeuried data
            for (var i = 0; i < recommendedParticipantsJson.length; i++) {
                if (recommendedParticipantsJson[i].users) {
                    //This scenario is for recommended groups
                    var group = {};
                    for (var key in recommendedParticipantsJson[i]) {
                        group[key] = recommendedParticipantsJson[i][key];
                    }
                    group.users = [];
                    for (var j = 0; j < recommendedParticipantsJson[i].users.length; j++) {
                        //Get user details
                        var user = this._getUserDetails(recommendedParticipantsJson[i].users[j].id, recommendedParticipantsJson[i].users[j]);
                        user.groupId = recommendedParticipantsJson[i].id;
                        group.users.push(user);
                    }
                    filteredRecommendedParticipants.push(group);
                    continue;
                }
                filteredRecommendedParticipants.push(this._getUserDetails(recommendedParticipantsJson[i].id, recommendedParticipantsJson[i]));
            }
        } catch (e) {
            return filteredRecommendedParticipants;
        }
        return filteredRecommendedParticipants;
    },
    /**
     * @param string searchText
     */
    searchConferenceParticipants: function(searchText) {
        if (!searchText || !searchText.length > 0) {
            return {};
        }
        //Output results data
        var searchResults = {
            participants: [],
            errors: []
        };

        // Using the GlideStringUtil.escapeQueryTermSeparator to escape special characters within untrusted data when concatenating individual values into an encoded query
        searchText = GlideStringUtil.escapeQueryTermSeparator(searchText);

        // Initially search user records
        var userGrpRecords = [];
        var userGr = new GlideRecord(this.TABLE.SYS_USER);
        if (userGr.canRead()) {
            userGr.addActiveQuery();
            var encodedQuery = "user_nameLIKE" + searchText + "^ORnameLIKE" + searchText + "^ORmobile_phoneLIKE" + searchText + "^ORphoneLIKE" + searchText + "^ORemailLIKE" + searchText;
            userGr.addEncodedQuery(encodedQuery, true);
            //Add limit to not populate all the users at once
            userGr.setLimit(20);
            userGr.query();
            while (userGr.next()) {
                var obj = this._toJS(userGr, "user", ["name", "avatar"]);
                obj.type = "user";
                userGrpRecords.push(obj);
            }
            //If no user records are found then the search might possibly be a static search
            if (userGrpRecords.length == 0) {
                var staticValue = {};
                if (this.notifyUtil.validatePhoneNumber(searchText)) {
                    staticValue.id = searchText;
                    staticValue.label = searchText;
                    staticValue.type = "static_phone";
                    staticValue.phoneNumber = searchText;
                    userGrpRecords.push(staticValue);
                } else if (this.confUtils.isValidEmail(searchText)) {
                    staticValue.id = searchText;
                    staticValue.label = searchText;
                    staticValue.email = searchText;
                    staticValue.type = "static_email";
                    userGrpRecords.push(staticValue);
                }
            }
        } else {
            searchResults.errors.push("No read access to user records");
        }
        //Scan for groups
        var groupGr = new GlideRecord(this.TABLE.SYS_USER_GROUP);
        if (groupGr.canRead()) {
            groupGr.addEncodedQuery("nameLIKE" + searchText, true);
            //Add limit to not populate all the users at once
            groupGr.setLimit(20);
            groupGr.query();
            while (groupGr.next()) {
                var objGrp = this._toJS(groupGr, "group", ["name"]);
                objGrp.type = "group";
                userGrpRecords.push(objGrp);
            }
        } else {
            searchResults.errors.push("No read access to group records");
        }
        searchResults.participants = userGrpRecords;
        return searchResults;
    },
    //Validate and get Participants data
    validateAndGetParticipants: function(data) {
        var filteredParticipants = [];
        var notifyAjaxProcessor = new global.NotifyOnTaskAjaxProcessor_V2(null, null, null, data);
        var particpants = notifyAjaxProcessor.validateAndGetParticipants();
        try {
            var particpantsJson = JSON.parse(particpants);
            for (var i = 0; i < particpantsJson.length; i++) {
                if (!particpantsJson[i].users) {
                    //A type of user
                    if (data.userId) {
                        var userResultObj = this._getUserDetails(particpantsJson[i].id, particpantsJson[i]);
                        userResultObj.active = particpantsJson[i].active;
                        filteredParticipants.push(userResultObj);
                    } else {
                        //Static phone_number | email
                        filteredParticipants.push(particpantsJson[i]);
                    }
                } else {
                    // Is type group
                    var groupData = {};
                    groupData.id = particpantsJson[i].id;
                    groupData.name = particpantsJson[i].name;
                    groupData.message = particpantsJson[i].message;
                    groupData.showGroupName = particpantsJson[i].showGroupName;
                    groupData.users = [];
                    for (var j = 0; j < particpantsJson[i].users.length; j++) {
                        var participantObj = this._getUserDetails(particpantsJson[i].users[j].id, particpantsJson[i].users[j]);
                        participantObj.active = particpantsJson[i].users[j].active;
                        groupData.users.push(participantObj);
                    }
                    filteredParticipants.push(groupData);
                }
            }
        } catch (err) {
            //
        }
        return filteredParticipants;
    },
    doConferenceAction: function(action, confData) {
        var result = {
            status: false
        };
        var releaseVersion = gs.getProperty('itsm_family_release_version_check', 0);
        try {
            if (!(action === this.ACTIONS.MUTE || action === this.ACTIONS.UNMUTE || action === this.ACTIONS.KICK) || (releaseVersion && releaseVersion >= 24)) {
                result = this.confUtils.doConferenceAction(action, confData);
            } else {
                if (Array.isArray(confData.items) && confData.items.length === 0) {
                    result.errorMessages = [gs.getMessage("Something went wrong")];
                    return result;
                }
                var participantId = confData.items[0].notifyParticipantId;
                if (participantId && participantId.length === 0) {
                    result.errorMessages = [gs.getMessage("Something went wrong")];
                    return result;
                }
                var participantGR = this._getGlideRecord(this.TABLE.NOTIFY_PARTICIPANT, participantId);
                switch (action) {
                    case this.ACTIONS.KICK:
                        if (!this.confUtils.canKick(participantGR)) {
                            result.errorMessages = [gs.getMessage("You don't have permission to do this action")];
                        } else
                            result = this.confUtils.kickByParticipantGR(participantGR);
                        break;
                    case this.ACTIONS.MUTE:
                        if (!this.confUtils.canMute(participantGR)) {
                            result.errorMessages = [gs.getMessage("You don't have permission to do this action")];
                        } else
                            result = this.confUtils.muteByParticipantGR(participantGR);
                        break;
                    case this.ACTIONS.UNMUTE:
                        if (!this.confUtils.canUnmute(participantGR)) {
                            result.errorMessages = [gs.getMessage("You don't have permission to do this action")];
                        } else
                            result = this.confUtils.unmuteByParticipantGR(participantGR);
                }
            }
        } catch (e) {
            result.errorMessages = [e.message];
        }

        //adding additional property to result template
        result.action = action;
        return result;
    },
    _toJS: function(gr, type, fields) {
        var res = {};
        res["sys_id"] = gr.getUniqueValue();
        fields.forEach(function(field) {
            if (field == "name" && type == "user") {
                var firstName = gr.getValue("first_name") || "";
                var lastName = gr.getValue("last_name") || "";
                var name = firstName;
                if (lastName) {
                    if (firstName)
                        name += " ";
                    name += lastName;
                }
                res[field] = name;
            } else {
                res[field] = gr.getValue(field, "");
            }
        });
        return res;
    },
    fetchPreFilledParticipants: function(data) {
        var participants = data.participants;
        var table = data.table;
        var sysId = data.sysId;
        var type = data.type;
        if (!Array.isArray(participants) || participants.length == 0) {
            return;
        }
        var result = [];
        for (var index in participants) {
            var toBevalidatedData = {
                table: table,
                sysId: sysId,
                isSMS: type === "sendSms",
                userId: participants[index].type === "user" ? participants[index].value : "",
                email: participants[index].type === "email" ? participants[index].value : "",
                groupId: "",
                confId: "",
                phoneNumber: participants[index].type === "phone_number" ? participants[index].value : "",
            };
            try {
                result.push(this.validateAndGetParticipants(toBevalidatedData)[0]);
            } catch (e) {
                continue;
            }
        }
        return result;
    },
    canViewCalls: function(table, sysId) {
        var releaseVersion = gs.getProperty('itsm_family_release_version_check', 0);
        if (releaseVersion == 0 && table === 'interaction')
            return false;
        var canLaunchCall = (typeof this.notifyUtil.hasAccessToCalls === 'function' && this.notifyUtil.hasAccessToCalls()) || this.notifyUtil._hasAccessToUiActions();
        if (!canLaunchCall)
            return false;
        var exPointImplementations = new GlideScriptedExtensionPoint().getExtensions(this.NOTIFY_UIB_VISIBILITY_HANDLER);
        if (exPointImplementations) {
            for (i = 0; i < exPointImplementations.length; i++) {
                var handler = exPointImplementations[i];
                if (
                    typeof handler.handles === "function" && handler.handles(table) &&
                    typeof handler.canShowCallsTab === "function"
                ) return handler.canShowCallsTab(sysId, table);
            }
        }
        return false;
    },
    getUserNameByID: function(userIDs) {
        var userIDNameMap = {};
        var userGR = new GlideRecordSecure(this.TABLE.SYS_USER);
        userGR.addEncodedQuery("user_nameIN" + userIDs.join(","), false);
        userGR.query();
        while (userGR.next()) {
            userIDNameMap[userGR.getValue(this.FIELD.USER_NAME)] = userGR.getValue(this.FIELD.NAME);
        }
        return userIDNameMap;
    },
    getOrganiserDisplayValue: function(organiserUserName, userIDNameMap) {
        var organiserDisplayValue = userIDNameMap[organiserUserName];
        if (organiserUserName === gs.getUserName()) {
            organiserDisplayValue = userIDNameMap[organiserUserName] + " (me)";
        }
        return organiserDisplayValue;
    },
    getPollingInterval: function() {
        var pollingInterval = Number(gs.getProperty(this.ACTIVE_PARTICIPANTS_POLLING_INTERVAL, this.POLLING_INTERVAL.DEFAULT));
        pollingInterval = isNaN(pollingInterval) ? this.POLLING_INTERVAL.DEFAULT : pollingInterval;
        pollingInterval = (pollingInterval < this.POLLING_INTERVAL.MIN) ? this.POLLING_INTERVAL.MIN : pollingInterval;
        return pollingInterval;
    },
    getActiveParticipantsPerCall: function(sourceSysId, sourceIds) {
        var calls = {};
        var source = "";
        if (sourceIds && sourceIds.length > 0) {
            var sourceQuery = "";
            var sourceIdsArray = sourceIds.split(",");
            for (var index in sourceIdsArray) {
                sourceQuery += "notify_conference_call.source=" + GlideStringUtil.escapeQueryTermSeparator(sourceIdsArray[index]);
                if (index < sourceIdsArray.length - 1) {
                    sourceQuery += "^OR";
                }
            }
            source = sourceQuery;
        } else {
            // Using the GlideStringUtil.escapeQueryTermSeparator to escape special characters within untrusted data when concatenating individual values into an encoded query
            source = "notify_conference_call.source=" + GlideStringUtil.escapeQueryTermSeparator(sourceSysId);
        }

        // Evaluating active participants per conference call
        var participantGR = new GlideRecord(this.TABLE.NOTIFY_PARTICIPANT);
        participantGR.addEncodedQuery(source + "^notify_conference_call.active=true^active=true", true);
        participantGR.orderByDesc(this.FIELD.LAST_ACTIVE_ON);
        participantGR.query();
        while (participantGR.next()) {
            var callID = participantGR.getValue(this.FIELD.NOTIFY_CONFERENCE_CALL);
            var ccGR = this._getGlideRecord(this.TABLE.NOTIFY_CONFERENCE_CALL, callID);
            if (!ccGR)
                continue;
            var sp = participantGR.notify_conference_call.service_provider + "";
            var call = {
                activeParticipants: this.getActiveParticipantsTemplate(),
                isLoggedInUserActiveParticipant: false,
            };

            if (!calls[callID])
                calls[callID] = call;

            calls[callID].activeParticipants.count += 1;
            var userIdentifier = null;
            if (sp === this.TELEPHONY_PROVIDER)
                userIdentifier = (participantGR.user ? participantGR.user.name : (participantGR.phone_number ? participantGR.phone_number : "")) + "";
            else
                userIdentifier = (participantGR.user ? participantGR.user.name : (participantGR.email ? participantGR.email : "")) + "";
            if ((calls[callID].activeParticipants.count > this.FIRST_N_PARTICIPANTS_ON_CARD.AVATAR) && (calls[callID].activeParticipants.count <= this.FIRST_N_PARTICIPANTS_ON_CARD.TOOLTIP)) {
                calls[callID].activeParticipants.firstNTooltipParticipants += (", " + userIdentifier);
                if (calls[callID].activeParticipants.firstNTooltipParticipants.slice(0, 2) === ", ")
                    calls[callID].activeParticipants.firstNTooltipParticipants = calls[callID].activeParticipants.firstNTooltipParticipants.slice(2);
            }
            calls[callID].activeParticipants.totalActiveParticipants.push(userIdentifier);
            if (calls[callID].activeParticipants.count > this.FIRST_N_PARTICIPANTS_ON_CARD.AVATAR) {
                if (calls[callID].activeParticipants.count > this.FIRST_N_PARTICIPANTS_ON_CARD.TOOLTIP && (calls[callID].activeParticipants.firstNTooltipParticipants.slice(-3) !== "..."))
                    calls[callID].activeParticipants.firstNTooltipParticipants += "...";
                var moreParticipantsCount = gs.getMessage("+{0} more", (calls[callID].activeParticipants.count - this.FIRST_N_PARTICIPANTS_ON_CARD.AVATAR).toString());
                calls[callID].activeParticipants.displayMessage = "<div title='" + calls[callID].activeParticipants.firstNTooltipParticipants + "'>" + moreParticipantsCount + "</div>";
            } else {
                calls[callID].activeParticipants.participants.push({
                    name: participantGR.user ? participantGR.user.name + "" : "Guest User",
                    label: userIdentifier,
                    imgSrc: participantGR.user.avatar + ".iix"
                });
            }

            if (participantGR.getValue(this.FIELD.USER) === gs.getUserID()) {
                calls[callID].isLoggedInUserActiveParticipant = true;
            }
        }
        /*
         *  This would reset the call's isLoggedInUserActiveParticipant property, responsible for the toggle of Join and Leave/End/LeaveAndEnd button's visibility
         *  This handles the case when no participant joined the call and to show the Join button for the user to join
         */
        var participantGA = new GlideAggregate(this.TABLE.NOTIFY_PARTICIPANT);
        participantGA.addEncodedQuery(source + "^notify_conference_call.active=true^active=false", true);
        participantGA.addAggregate("COUNT");
        participantGA.groupBy(this.TABLE.NOTIFY_CONFERENCE_CALL);
        participantGA.query();
        while (participantGA.next()) {
            var confCallID = participantGA.getValue(this.FIELD.NOTIFY_CONFERENCE_CALL);
            if (!calls[confCallID])
                calls[confCallID] = {
                    activeParticipants: this.getActiveParticipantsTemplate(),
                    isLoggedInUserActiveParticipant: false,
                };
        }

        return calls;
    },
    getActiveParticipantSessionsPerCall: function(sysId, isSourceSysId, sourceIds) {
        var loggedInUserActiveParticipantSessionsPerCall = {};
        var sessionGR = new GlideRecordSecure(this.TABLE.NOTIFY_PARTICIPANT_SESSION);
        if (isSourceSysId) {
            if (sourceIds && sourceIds.length > 0) {
                var sourceQuery = "";
                var sourceIdsArray = sourceIds.split(",");
                for (var index in sourceIdsArray) {
                    sourceQuery += "notify_participant.notify_conference_call.source=" + sourceIdsArray[index];
                    if (index < sourceIdsArray.length - 1) {
                        sourceQuery += "^OR";
                    }
                }
                sessionGR.addEncodedQuery("notify_participant.user=" + gs.getUserID() + "^" + sourceQuery + "^active=true", false);
            } else {
                sessionGR.addEncodedQuery("notify_participant.user=" + gs.getUserID() + "^notify_participant.notify_conference_call.source=" + sysId + "^active=true", false);
            }
        } else
            sessionGR.addEncodedQuery("notify_participant.user=" + gs.getUserID() + "^notify_participant.notify_conference_call=" + sysId + "^active=true", false);
        sessionGR.query();
        while (sessionGR.next()) {
            var callID = sessionGR.notify_participant.notify_conference_call + "";
            var sessionSysId = sessionGR.getValue(this.FIELD.SYS_ID);
            if (!loggedInUserActiveParticipantSessionsPerCall[callID])
                loggedInUserActiveParticipantSessionsPerCall[callID] = {};
            loggedInUserActiveParticipantSessionsPerCall[callID][sessionSysId] = null;
        }
        return loggedInUserActiveParticipantSessionsPerCall;
    },
    getRecordingsPerCall: function(sourceIds) {
        var recordingsPerCall = {};
        if (!sourceIds) return recordingsPerCall;
        var recordingGR = new GlideRecordSecure(this.TABLE.NOTIFY_RECORDING);
        var sourceQuery = "";
        var sourceIdsArray = sourceIds.split(",");
        for (var index in sourceIdsArray) {
            sourceQuery += "notify_conference_call.source=" + sourceIdsArray[index];
            if (index < sourceIdsArray.length - 1) {
                sourceQuery += "^OR";
            }
        }
        if (!sourceQuery) return recordingsPerCall;
        recordingGR.addEncodedQuery(sourceQuery + "^notify_conference_call.active=false^urlISNOTEMPTY", false);
        recordingGR.query();
        while (recordingGR.next()) {
            recordingsPerCall[recordingGR.getValue(this.FIELD.NOTIFY_CONFERENCE_CALL)] = recordingGR.getValue(this.FIELD.URL);
        }
        return recordingsPerCall;
    },
    sortArrayBasedOnProp: function(arr, prop) {
        arr.sort(function(a, b) {
            return b[prop] - a[prop];
        });
    },
    getConferenceCardData: function(callID) {
        var callData = {
            call: {},
            loggedInUserActiveParticipantSessionsPerCall: {},
        };
        if (!callID)
            return callData;
        var call = {},
            userIDs = [],
            userIDNameMap = {},
            loggedInUserActiveParticipantSessionsPerCall = this.getActiveParticipantSessionsPerCall(callID, false, "");
        var ccGR = new GlideRecord(this.TABLE.NOTIFY_CONFERENCE_CALL);
        if (ccGR.get(callID)) {
            var recording = {};
            recording[callID] = this.getConferenceCallRecordingLink(callID);
            call = this.getConferenceCallData(ccGR, userIDs, loggedInUserActiveParticipantSessionsPerCall, recording);
        }
        userIDNameMap = this.getUserNameByID(userIDs);
        call.organiser.displayName = this.getOrganiserDisplayValue(call.organiser.userName, userIDNameMap);
        callData.call = call;
        callData.loggedInUserActiveParticipantSessionsPerCall = loggedInUserActiveParticipantSessionsPerCall;
        return callData;
    },
    getAllConferenceCardsData: function(sourceIds) {
        var data = this.getConferenceCardsDataTemplate();
        if (!sourceIds)
            return data;
        if (sourceIds.length === 0)
            return data;
        // Utlity objects
        var calls = {},
            userIDs = [],
            userIDNameMap = {},
            loggedInUserActiveParticipantSessionsPerCall = this.getActiveParticipantSessionsPerCall(null, true, sourceIds),
            recordingsPerCall = this.getRecordingsPerCall(sourceIds);
        // Fetching details of each conference call record whose source is input's sys_id
        var ccGR = new GlideRecord(this.TABLE.NOTIFY_CONFERENCE_CALL);
        var sourceQuery = "";
        var sourceIdsArray = sourceIds.split(",");
        for (var index in sourceIdsArray) {
            sourceQuery += "source=" + sourceIdsArray[index];
            if (index < sourceIdsArray.length - 1) {
                sourceQuery += "^OR";
            }
        }
        ccGR.addEncodedQuery(sourceQuery);
        ccGR.setLimit(parseInt(gs.getProperty(this.MAX_CONFERENCE_CALLS_FETCH_LIMIT, 300)));
        ccGR.query();
        while (ccGR.next()) {
            calls[ccGR.getValue(this.FIELD.SYS_ID)] = this.getConferenceCallData(ccGR, userIDs, loggedInUserActiveParticipantSessionsPerCall, recordingsPerCall);
        }
        // converting object to array to pass into UI B repeater component
        userIDNameMap = this.getUserNameByID(userIDs);
        for (var callID in calls) {
            var organiser = calls[callID].organiser.userName;
            calls[callID].organiser.displayName = this.getOrganiserDisplayValue(organiser, userIDNameMap);
            if (calls[callID].active) {
                data.calls[this.CONFERENCE_CALL_TYPE_INDEX.ACTIVE].callRecords.push(calls[callID]);
            } else {
                data.calls[this.CONFERENCE_CALL_TYPE_INDEX.COMPLETED].callRecords.push(calls[callID]);
            }
        }
        var activeCallsCount = data.calls[this.CONFERENCE_CALL_TYPE_INDEX.ACTIVE].callRecords.length.toString();
        var completedCallsCount = data.calls[this.CONFERENCE_CALL_TYPE_INDEX.COMPLETED].callRecords.length.toString();
        data.calls[this.CONFERENCE_CALL_TYPE_INDEX.ACTIVE].callStatus = gs.getMessage("Active ({0})", activeCallsCount);
        data.calls[this.CONFERENCE_CALL_TYPE_INDEX.COMPLETED].callStatus = gs.getMessage("Completed ({0})", completedCallsCount);
        data.calls[this.CONFERENCE_CALL_TYPE_INDEX.UPCOMING].callStatus = gs.getMessage("Pending (0)");
        this.sortArrayBasedOnProp(data.calls[this.CONFERENCE_CALL_TYPE_INDEX.ACTIVE].callRecords, "startTimeEpoch");
        this.sortArrayBasedOnProp(data.calls[this.CONFERENCE_CALL_TYPE_INDEX.COMPLETED].callRecords, "lastUpdatedTimeEpoch");
        data.loggedInUserActiveParticipantSessionsPerCall = loggedInUserActiveParticipantSessionsPerCall;
        data.serviceProviderCaps = this.confUtils.getServiceProviderDetails().caps;
        return data;
    },
    getFormattedCallDuration: function(duration) {
        var hours = Math.floor(duration / (60 * 60 * 1000));
        var minutes = Math.floor((duration - (hours * 60 * 60 * 1000)) / (60 * 1000));
        var seconds = Math.floor((duration - ((hours * 60 + minutes) * 60 * 1000)) / 1000);

        hours = (hours > 9 ? '' : '0') + hours.toString();
        minutes = (minutes > 9 ? '' : '0') + minutes.toString();
        seconds = (seconds > 9 ? '' : '0') + seconds.toString();
        return hours + ':' + minutes + ':' + seconds;
    },
    getConferenceCallData: function(ccGR, userIDs, loggedInUserActiveParticipantSessionsPerCall, recordingsPerCall) {
        var callID = ccGR.getValue(this.FIELD.SYS_ID);
        var active = ccGR.getValue(this.FIELD.ACTIVE) === "1";
        var serviceProvider = ccGR.getDisplayValue(this.FIELD.SERVICE_PROVIDER);
        var notifyNumber = ccGR.getDisplayValue(this.FIELD.NOTIFY_NUMBER);
        var organiserID = ccGR.getValue(this.FIELD.SYS_CREATED_BY);
        var conferenceCallNumber = ccGR.getValue(this.FIELD.NUMBER);
        var sourceTable = ccGR.getValue(this.FIELD.TABLE);
        var sourceSysId = ccGR.getValue(this.FIELD.SOURCE);
        var notifyNumberSysId = ccGR.getValue(this.FIELD.NOTIFY_NUMBER);
        var conferenceTitle = ccGR.getDisplayValue(this.FIELD.CONFERENCE_TITLE);
        var isConferenceLeader = this.notifyUtil.isConferenceLeader(ccGR);
        userIDs.push(organiserID);
        var invite = null;
        var joinUrl = "";
        if (serviceProvider === this.TELEPHONY_PROVIDER) {
            var inviteMessage = gs.getMessage("Dial-in number: {0}", notifyNumber);
            var inviteAccessCode = gs.getMessage("Access code: {0}", ccGR.getValue(this.FIELD.CODE));
            invite = inviteMessage + "\n" + inviteAccessCode;
        } else {
            try {
                var serviceProviderData = JSON.parse(ccGR.getValue(this.FIELD.SERVICE_PROVIDER_DATA));
                invite = serviceProviderData.joinUrl;
                if (serviceProviderData.joinUrl)
                    joinUrl = serviceProviderData.joinUrl;
            } catch (e) {
                //
            }
        }
        var icon = this.SP_NAME_ICON_MAP[serviceProvider];
        if (!icon) {
            if (serviceProvider === this.TELEPHONY_PROVIDER) {
                icon = this.DEFAULT_SP_NAME_ICON_MAP[this.TELEPHONY_PROVIDER];
            } else {
                icon = this.DEFAULT_SP_NAME_ICON_MAP[this.CONFERENCE_PROVIDER];
            }
        }
        var call = this.getCallTemplate();
        call.callID = callID;
        call.conferenceCallNumber.value = conferenceCallNumber;
        call.conferenceCallNumber.displayValue = this.CONFERENCE_PROVIDER_DISPLAY_VALUE + ": " + conferenceCallNumber;
        call.source.table = sourceTable;
        call.source.sysId = sourceSysId;
        call.startTime = ccGR.getDisplayValue(this.FIELD.SYS_CREATED_ON);
        call.startTimeEpoch = new GlideDateTime(ccGR.getValue(this.FIELD.SYS_CREATED_ON)).getNumericValue();
        call.lastUpdatedTimeEpoch = new GlideDateTime(ccGR.getValue(this.FIELD.SYS_UPDATED_ON)).getNumericValue();
        call.callDuration = this.getFormattedCallDuration(new GlideDateTime(ccGR.getValue(this.FIELD.DURATION)).getNumericValue());
        call.sp.displayName = (serviceProvider === this.TELEPHONY_PROVIDER) ? (ccGR.notify_number.owner + " " + notifyNumber) : serviceProvider;
        call.sp.name = serviceProvider;
        call.sp.icon = icon;
        call.title.original = conferenceTitle;
        call.title.html = "<div style='display: grid'><div title='" + conferenceTitle + "' style='white-space: nowrap; overflow: hidden; text-overflow: ellipsis;'>" + conferenceTitle + "</div></div>";
        call.organiser.userName = organiserID;
        call.isLoggedInUserActiveParticipant = false;
        call.canLoggedInUserEndCall = this.confUtils.canEnd(ccGR);
        call.canLoggedInUserReinitiateCall = this._doesProviderSupportAction(ccGR, this.ACTIONS.START) && isConferenceLeader;
        call.canLoggedInUserAddParticipants = this.confUtils.canJoinFromConfGR(ccGR);
        call.canLoggedInUserMultiMute = this._doesProviderSupportAction(ccGR, this.ACTIONS.MULTI_MUTE) && isConferenceLeader;
        call.canLoggedInUserUnmute = this._doesProviderSupportAction(ccGR, this.ACTIONS.UNMUTE);
        call.canLoggedInUserMute = this._doesProviderSupportAction(ccGR, this.ACTIONS.MUTE);
        call.canLoggedInUserLeaveCall = this._doesProviderSupportAction(ccGR, this.ACTIONS.KICK);
        call.canLoggedInUserKickOthers = this._doesProviderSupportAction(ccGR, this.ACTIONS.KICK) && isConferenceLeader;

        var loggedInUserNotifyParticipantGR = this._getLoggedInUserNotifyParticipantGR(callID);
        if (loggedInUserNotifyParticipantGR)
            call.loggedInUserNotifyParticipantID = loggedInUserNotifyParticipantGR.getUniqueValue();
        call.active = active;
        call.activeParticipants = this.getActiveParticipantsTemplate();
        var disableJoinButton = (typeof loggedInUserActiveParticipantSessionsPerCall[callID] === "undefined") ? false : (Object.keys(loggedInUserActiveParticipantSessionsPerCall[callID]).length !== 0);
        call.disableJoinConference = disableJoinButton;
        call.invite = invite;
        call.invalidProvider = false;
        if (!joinUrl) {
            call.joinUrl = joinUrl;
        }
        var data = {
            table: sourceTable,
            sysId: sourceSysId,
            type: ""
        };
        var configuredServiceProvider = this.getInitialConferenceDialogDetails(data).serviceProviders;
        var listOfConfiguredServiceProviders = [];
        configuredServiceProvider.forEach(function(provider) {
            if (provider.type !== 'number') {
                listOfConfiguredServiceProviders.push(provider.name);
            } else {
                listOfConfiguredServiceProviders.push(provider.number);
            }
        });
        if (serviceProvider === this.TELEPHONY_PROVIDER) {
            var notifyNumberGR = new GlideRecord(this.TABLE.NOTIFY_NUMBER);
            var defaultNumber = "";
            var telephonyNumber = "";
            if (notifyNumberGR.get(notifyNumberSysId) && notifyNumberGR.getValue(this.FIELD.ACTIVE) == true) {
                call.number = notifyNumberGR.getValue(this.FIELD.NUMBER);
            } else {
                configuredServiceProvider.forEach(function(provider) {
                    if (provider.type === 'number') {
                        telephonyNumber = provider.number;
                        if (provider.defaultFlag)
                            defaultNumber = provider.number;
                    }
                });
                if (telephonyNumber == "") {
                    call.invalidProvider = true;
                }
            }
            if (telephonyNumber != "") {
                call.number = defaultNumber != "" ? defaultNumber : telephonyNumber;
            }
            call.notifyNumber = notifyNumber;
            call.conferenceCode = ccGR.getValue(this.FIELD.CODE);
        } else {
            if (listOfConfiguredServiceProviders.indexOf(serviceProvider) == -1) {
                call.invalidProvider = true;
            }
        }
        if (call.invalidProvider == true) {
            call.alternativeProvider = listOfConfiguredServiceProviders[0];
        }
        call.message = ccGR.getValue(this.FIELD.DESCRIPTION);
        call.recordingLink = (typeof recordingsPerCall !== "undefined" && typeof recordingsPerCall[callID] !== "undefined") ? recordingsPerCall[callID] : null;
        call.meetingId = ccGR.getValue(this.FIELD.CONFERENCE_CALL_ID);
        var callRecord = this._fetchTranscriptSummary(callID);
        Object.assign(call, callRecord);
        return call;
    },
    _doesProviderSupportAction: function(conferenceGR, action) {
        var caps = this.confUtils.getCapabilitiesFromConferenceGR(conferenceGR);
        var actionSupportInfo = caps[action] || {};
        if (!this.confUtils.isActionSupported(actionSupportInfo.isSupported))
            return false;
        return true;
    },
    getParticipantsOnACall: function(conferenceCallSysId) {
        var participantIDs = [];
        var conferenceParticipantGR = new GlideRecord(this.TABLE.NOTIFY_PARTICIPANT);
        conferenceParticipantGR.addQuery("notify_conference_call", conferenceCallSysId);
        conferenceParticipantGR.query();
        while (conferenceParticipantGR.next()) {
            var participant = {};
            if (conferenceParticipantGR.getValue(this.FIELD.USER)) {
                participant.type = this.FIELD.USER;
                participant.value = conferenceParticipantGR.getValue(this.FIELD.USER);
                participantIDs.push(participant);
            } else if (conferenceParticipantGR.getValue(this.FIELD.EMAIL)) {
                participant.type = this.FIELD.EMAIL;
                participant.value = conferenceParticipantGR.getValue(this.FIELD.EMAIL);
                participantIDs.push(participant);
            } else if (conferenceParticipantGR.getValue(this.FIELD.PHONE_NUMBER)) {
                participant.type = this.FIELD.PHONE_NUMBER;
                participant.value = conferenceParticipantGR.getValue(this.FIELD.PHONE_NUMBER);
                participantIDs.push(participant);
            }
        }
        return participantIDs;
    },
    getConferenceDetails: function(conferenceSysId, sourceTable, sourceSysId) {
        if (!conferenceSysId || !sourceTable || !sourceSysId) {
            return;
        }
        var result = {};
        var serviceProviderCaps = {};
        var conferenceDetails = this.getConferenceCardData(conferenceSysId);
        serviceProviderCaps = this.confUtils.getServiceProviderDetails().caps;
        result = {
            serviceProviderCaps: serviceProviderCaps,
            conferenceDetails: conferenceDetails,
            conferenceTemplate: this.confUtils.getConferenceInputDataTemplate()
        };
        return result;
    },
    _getGlideRecord: function(table, sysId) {
        var gr = new GlideRecord(table);
        if (gr.get(sysId))
            return gr;
        else
            return null;
    },
    getParticipantsDetailsInAConference: function(conferenceSysId) {
        if (!conferenceSysId) {
            return;
        }
        var conferenceCall = {};
        var conferenceCallGr = new GlideRecord(this.TABLE.NOTIFY_CONFERENCE_CALL);
        conferenceCallGr.get(conferenceSysId);
        conferenceCall.isActive = conferenceCallGr.active == true ? true : false;
        var organizerName = conferenceCallGr.getValue(this.FIELD.SYS_CREATED_BY);
        var participants = [];
        var participantGr = new GlideRecord(this.TABLE.NOTIFY_PARTICIPANT);
        participantGr.addQuery(this.FIELD.NOTIFY_CONFERENCE_CALL, conferenceSysId);
        participantGr.setLimit(parseInt(gs.getProperty(this.MAX_PARTICIPANTS_FETCH_LIMIT, 1300)));
        participantGr.query();
        while (participantGr.next()) {
            var obj = {};
            var participantSessionGr = new GlideRecord(this.TABLE.NOTIFY_PARTICIPANT_SESSION);
            participantSessionGr.addQuery(this.FIELD.NOTIFY_PARTICIPANT, participantGr.getUniqueValue());
            participantSessionGr.query();
            var participantName = participantGr.user.user_name;
            var isOrganizer = (participantName == organizerName) ? true : false;
            var isMe = (participantName == gs.getUserName()) ? true : false;
            obj.hasJoined = false;
            if (participantSessionGr.hasNext() == true && participantGr.getValue(this.FIELD.DURATION) != "") {
                obj.hasJoined = true;
            }
            participantSessionGr.addQuery(this.FIELD.ACTIVE, true);
            participantSessionGr.query();
            obj.isHost = !!participantGr.host;
            obj.isReady = true;
            obj.active = (!!participantGr.active === true);
            obj.speaking = (!!participantGr.speaking === true);
            obj.muted = (!!participantGr.muted === true);
            obj.notifyParticipantSysId = participantGr.getUniqueValue() + "";
            obj.startTimeEpoch = new GlideDateTime(participantGr.getValue(this.FIELD.SYS_CREATED_ON)).getNumericValue();
            if (participantSessionGr.next()) {
                obj.joinedTimeEpoch = new GlideDateTime(participantSessionGr.getValue(this.FIELD.SYS_CREATED_ON)).getNumericValue();
            }
            var userGr = participantGr.user.getRefRecord();
            if (userGr.isValidRecord()) {
                obj.name = userGr.first_name + " " + userGr.last_name;
                obj.sysId = userGr.getUniqueValue() + "";
                obj.title = userGr.title + "";
                obj.isValidUser = true;
            } else {
                //Case for unknown user
                if (participantGr.getValue(this.FIELD.EMAIL)) {
                    obj.contactDetails = participantGr.getValue(this.FIELD.EMAIL);
                } else if (participantGr.getValue(this.FIELD.PHONE_NUMBER)) {
                    obj.contactDetails = participantGr.getValue(this.FIELD.PHONE_NUMBER);
                }
                obj.name = gs.getMessage("Guest user");
                obj.icon = this.DEFAULT_ICONS_MAP["UnknownUser"];
                obj.isValidUser = false;
            }
            if (isOrganizer && isMe) {
                obj.name = obj.name + (" (Organizer,me)");
            } else if (isOrganizer) {
                obj.name = obj.name + (" (Organizer)");
            } else if (isMe) {
                obj.name = obj.name + (" (me)");
            }
            participants.push(obj);
        }
        conferenceCall.participants = participants;

        return conferenceCall;
    },

    isActiveRecord: function(table, sysId) {
        if (!table || !sysId) return;
        var gr = this._getGlideRecord(table, sysId);
        return gr.active == true;
    },

    getLoggedInUserActions: function(conferenceSysId) {
        if (!conferenceSysId)
            return;
        var conferenceCallGr = new GlideRecord(this.TABLE.NOTIFY_CONFERENCE_CALL);
        if (!conferenceCallGr.get(conferenceSysId))
            return;
        var isConferenceLeader = this.notifyUtil.isConferenceLeader(conferenceCallGr);
        var canLoggedInUserTriggerActions = {
            canEndCall: this.confUtils.canEnd(conferenceCallGr),
            canReinitiateCall: this._doesProviderSupportAction(conferenceCallGr, this.ACTIONS.START) && isConferenceLeader,
            canAddParticipants: this.confUtils.canJoinFromConfGR(conferenceCallGr),
            canMultiMute: this._doesProviderSupportAction(conferenceCallGr, this.ACTIONS.MULTI_MUTE) && isConferenceLeader,
            canUnmute: this._doesProviderSupportAction(conferenceCallGr, this.ACTIONS.UNMUTE),
            canMute: this._doesProviderSupportAction(conferenceCallGr, this.ACTIONS.MUTE),
            canLeaveCall: this._doesProviderSupportAction(conferenceCallGr, this.ACTIONS.KICK),
            canKickOthers: this._doesProviderSupportAction(conferenceCallGr, this.ACTIONS.KICK) && isConferenceLeader
        };

        return canLoggedInUserTriggerActions;
    },

    getParticipantObjectFromParticipantSysID: function(participantSydId) {
        if (!participantSydId) {
            return {};
        }
        var result = {};
        var gr = new GlideRecord(this.TABLE.NOTIFY_PARTICIPANT);
        if (gr.get(participantSydId)) {
            result.isReady = true;
            result.notifyParticipantSysId = participantSydId;
            result.hasJoined = false;
            result.isHost = (!!gr.host === true);
            result.active = gr.active == true ? true : false;
            result.speaking = (!!gr.speaking === true);
            result.muted = (!!gr.muted === true);
            result.startTimeEpoch = new GlideDateTime(gr.getValue('sys_created_on')).getNumericValue();
            result.name = gr.getDisplayValue('user');
            result.sysId = gr.getValue('user');
            var userGr = this._getGlideRecord(this.TABLE.SYS_USER, result.sysId);
            if (userGr && userGr.isValidRecord()) {
                result.title = userGr.title + "";
            } else {
                if (gr.getValue(this.FIELD.EMAIL)) {
                    result.contactDetails = gr.getValue(this.FIELD.EMAIL);
                } else if (gr.getValue(this.FIELD.PHONE_NUMBER)) {
                    result.contactDetails = gr.getValue(this.FIELD.PHONE_NUMBER);
                }
                result.name = gs.getMessage("Guest user");
                result.icon = this.DEFAULT_ICONS_MAP["UnknownUser"];
            }
        }
        return result;
    },

    _getLoggedInUserNotifyParticipantGR: function(conferenceSysId) {
        if (!conferenceSysId) {
            return;
        }
        var participantGr = new GlideRecord(this.TABLE.NOTIFY_PARTICIPANT);
        participantGr.addQuery(this.FIELD.NOTIFY_CONFERENCE_CALL, conferenceSysId);
        participantGr.addQuery(this.FIELD.USER, gs.getUserID());
        participantGr.query();
        if (participantGr.next()) {
            return participantGr;
        }
        return;
    },

    _getConferenceTranscriptGR: function(confId) {
        var transcriptSummaryGR = new GlideRecord(this.TABLE.NOTIFY_TRANSCRIPT_SUMMARY);
        transcriptSummaryGR.addQuery(this.FIELD.NOTIFY_CONFERENCE_CALL, confId);
        transcriptSummaryGR.query();
        if (transcriptSummaryGR.next()) return transcriptSummaryGR;
        return null;
    },

    _fetchTranscriptSummary: function(confId) {
        var callRecord = {
            isSummaryAvailable: false,
            isTranscriptAvailable: false,
            attachmentSysId: ""
        };
        var transcriptSummaryGR = this._getConferenceTranscriptGR(confId);
        if (transcriptSummaryGR) {
            callRecord.isSummaryAvailable = !gs.nil(transcriptSummaryGR.getValue(this.FIELD.PROVIDER_SUMMARY));
            callRecord.isTranscriptAvailable = !gs.nil(transcriptSummaryGR.getValue(this.FIELD.TRANSCRIPT_ID));
            callRecord.attachmentSysId = transcriptSummaryGR.getValue(this.FIELD.SYS_ATTACHMENT) || "";
        }
        return callRecord;
    },

    getConferenceCallSummary: function(confId) {
        var res = {
            message: sn_i18n.Message.getMessage('sn_uib_notify', 'Error in extract summary for meeting.')
        };
        try {
            var transcriptSummaryGR = this._getConferenceTranscriptGR(confId);
            if (transcriptSummaryGR) {
                var summary = transcriptSummaryGR.getValue('provider_summary');
                if (!gs.nil(summary)) {
                    summary = JSON.parse(summary);
                    res.title = summary.summary_title;
                    res.overview = summary.summary_overview;
                    res.message = sn_i18n.Message.getMessage('sn_uib_notify', 'Meeting summary extracted successfully.');
                }
            }
        } catch (err) {
            gs.error('Error in getting summary for a conference call as {0}.', err.toString());
        }
        return res;
    },

    getConferenceCallRecordingLink: function(confId) {
        var recordingGR = new GlideRecord(this.TABLE.NOTIFY_RECORDING);
        recordingGR.addQuery(this.FIELD.NOTIFY_CONFERENCE_CALL, confId);
        recordingGR.query();
        if (recordingGR.next()) {
            var recordingURL = recordingGR.getValue('url');
            if (!gs.nil(recordingURL)) return recordingURL;
        }
        return "";
    },

    downloadAndAttachTranscript: function(confId) {
        var ccGR = new GlideRecord(this.TABLE.NOTIFY_CONFERENCE_CALL);
        if (!ccGR.get(confId))
            return {
                message: sn_i18n.Message.getMessage('sn_uib_notify', 'Conference call record is not present.')
            };

        var transcriptGR = this._getConferenceTranscriptGR(confId);
        if (gs.nil(transcriptGR))
            return {
                message: sn_i18n.Message.getMessage('sn_uib_notify', 'Transcript record is not availale for conference {number}', {
                    number: ccGR.getValue('number')
                })
            };

        try {
            var transcriptId = transcriptGR.getValue(this.FIELD.TRANSCRIPT_ID);
            transcriptGR.setValue(this.FIELD.SYS_ATTACHMENT, "-1");
            transcriptGR.update();
            var serviceProvider = ccGR.getValue('service_provider');
            var handler = null;
            var providersMap = this.notifyUtil.getConferenceProviderDrivers();
            for (var provider in providersMap) {
                if (provider === serviceProvider) handler = providersMap[provider];
            }

            if (!handler || typeof handler.downloadTranscript != 'function') {
                throw new Error('Conference driver not found for ' + serviceProvider + ' provider to Download Transcript.');
            }

            var response = handler.downloadTranscript(transcriptId);
            if (gs.nil(response.transcript)) {
                throw new Error(response.message);
            }

			var transcriptFileName = transcriptId.length > 40 ? ccGR.getValue("number") + "_transcripts_" + (transcriptId.slice(0, 10)) : transcriptId;

            var attachment = new global.Attachment();
            var attachmentResponse = attachment.write(transcriptGR.getTableName(), transcriptGR.getUniqueValue(), transcriptFileName + '.vtt', 'text/vtt', response.transcript);

            // Updating notify transcript record with attachment
            var attachmentGR = new GlideRecord('sys_attachment');
            attachmentGR.addQuery('table_name', transcriptGR.getTableName());
            attachmentGR.addQuery('table_sys_id', transcriptGR.getUniqueValue());
            attachmentGR.addQuery('file_name', transcriptFileName + '.vtt');
            attachmentGR.query();
            if (attachmentGR.next()) {
                transcriptGR.setValue(this.FIELD.SYS_ATTACHMENT, attachmentGR.getUniqueValue());
                transcriptGR.update();
                return {
                    attachmentId: attachmentGR.getUniqueValue()
                };
            } else {
                gs.warn('Attachment failed for confId Id {0}', confId);
            }
        } catch (err) {
            gs.error("Error in download/attach transcript for conference Id {0} as {1}.", [confId, err.toString()]);
        }
        transcriptGR.setValue(this.FIELD.SYS_ATTACHMENT, "");
        transcriptGR.update();
        return {
            message: sn_i18n.Message.getMessage('sn_uib_notify', 'Not able to extract transcript for conference {number}. Please check the logs for more info.', {
                number: ccGR.getValue('number')
            })
        };
    },

    postSummary: function(content, field, table, sysId) {
        var res = {
            message: sn_i18n.Message.getMessage('sn_uib_notify', 'Unable to post summary to activity stream.'),
            status: false
        };
        try {
            var gr = new GlideRecordSecure(table);
            gr.get(sysId);
            gr[field] = '[code]' + content + '[/code]';
            gr.update();
            res.message = sn_i18n.Message.getMessage('sn_uib_notify', 'Successfully posted summary to Activity stream as comments.');
            res.status = true;
        } catch (e) {
            gs.error("Error in post summary to Activity stream " + e.toString());
        }
        return res;
    },

    type: 'NotifyUXFConferenceUtilSNC'
};
