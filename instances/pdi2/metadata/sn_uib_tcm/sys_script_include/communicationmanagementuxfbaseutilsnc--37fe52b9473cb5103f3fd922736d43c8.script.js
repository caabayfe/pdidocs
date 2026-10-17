var CommunicationManagementUXFBaseUtilSNC = Class.create();
CommunicationManagementUXFBaseUtilSNC.prototype = {
    initialize: function() {
        this.communicationManagementUtil = new sn_comm_management.CommunicationManagementUtil();
    },

    CONSTANTS: {
        MAX_RECIPIENT_SEARCH_RESULTS_PER_TYPE: 20,
        MAX_SMS_CONTACT_SEARCH_RESULTS: 5,
        ICONS: {
            USER_GROUP_OUTLINE: "user-group-outline"
        },
        SOURCE: "source",
        COMM_PLAN: "comm_plan",
    },

    TABLES: {
        INCIDENT: {
            NAME: "incident",
            FIELDS: {
                MAJOR_INCIDENT_STATE: {
                    NAME: "major_incident_state",
                    VALUE: {
                        PROPOSED: "proposed",
                        ACCEPTED: "accepted"
                    }
                },
            }

        },
        INCIDENT_ALERT: {
            NAME: "incident_alert",
            FIELDS: {
                SOURCE_INCIDENT: "source_incident"
            }
        },
        INCIDENT_ALERT_TASK: {
            NAME: "incident_alert_task",
            FIELDS: {
                NAME: "STATE",
                VALUE: {
                    "pending": -5,
                    "open": 1,
                    "in-progress": 2,
                    "complete": 3,
                    "skipped": 7
                }
            }
        },
        CONTACT_RESPONSIBILITY: {
            NAME: "contact_responsibility",
            FIELDS: {
                TYPE: "type",
                NAME: "name"
            }
        },
        TASK: {
            NAME: "task"
        },
        COMM_PLAN: {
            NAME: "comm_plan",
            FIELDS: {
                SOURCE: "source",
                SYS_CLASS_NAME: "sys_class_name",
                SHORT_DESCRIPTION: "short_description",
                STATE: {
                    NAME: "state",
                    VALUE: {
                        OPEN: "open",
                        NEW: "new",
                        WORK_IN_PROGRESS: "work_in_progress"
                    }
                },
                SYS_ID: "sys_id"
            }
        },
        SYS_USER: {
            NAME: "sys_user",
            FIELDS: {
                NAME: "name",
                AVATAR: "avatar"
            }
        },
        SYS_USER_GROUP: {
            NAME: "sys_user_group",
            FIELDS: {
                NAME: "name"
            }
        },
        SYS_USER_GRMEMBER: {
            NAME: "sys_user_grmember",
            FIELDS: {
                USER: "user"
            }
        },
        SN_PUBLICATIONS_RECIPIENT_LIST: {
            NAME: "sn_publications_recipients_list",
            FIELDS: {
                NAME: "name"
            }
        },
        CONTACT: {
            NAME: "contact",
            FIELDS: {
                TABLE: "table",
                DOCUMENT: "document",
                TYPE: {
                    NAME: "type",
                    VALUE: {
                        USER: "sys_user",
                        GROUP: "sys_user_group",
                        RECIPIENT_LIST: "sn_publications_recipients_list"
                    }
                },
                USER: "user",
                GROUP: "group",
                RECIPIENT_LIST: "recipient_list",
                RESPONSIBILITY: "responsibility",
                CREATED: "sys_created_on"
            }
        },
        COMM_TASK: {
            NAME: "comm_task",
            FIELDS: {
                COMMUNICATION_FREQUENCY: {
                    NAME: "communication_frequency",
                    VALUE: {
                        RECURRING: "recurring",
                        ONE_TIME: "one_time"
                    }
                }
            }
        },
        COMM_CHANNEL: {
            NAME: "comm_channel",
            FIELDS: {
                COMM_TASK: "comm_task"
            }
        }
    },

    CHANNELS: {
        SMS: 'sms'
    },

    getChannelMap: function(sourceTable) {
        return this.communicationManagementUtil.getChannelMap(sourceTable);
    },

    getExistingChannelTypes: function(commTaskSysId) {
        if (gs.nil(commTaskSysId)) return "";
        var commChannelTable = this.TABLES.COMM_CHANNEL;
        var channelGr = new GlideRecord(commChannelTable.NAME);
        channelGr.addQuery(commChannelTable.FIELDS.COMM_TASK, commTaskSysId);
        channelGr.setLimit(1);
        channelGr.query();
        if (channelGr.next()) {
            if (channelGr.comm_channel_config.classification == "bridge") return "collaboration";
            else return "communication";
        }
        return "";
    },

    canCreateChannel: function(commTaskGr) {
        var channelMap = this.getChannelMap();
        for (var channel in channelMap) {
            var commChannelGr = new GlideRecord(channelMap[channel]["inst_table"]);
            commChannelGr.newRecord();
            commChannelGr.setValue(this.TABLES.COMM_TASK.NAME, commTaskGr.getUniqueValue());
            if (commChannelGr.canCreate() && commTaskGr.active) return true;
        }
        return false;
    },

    canDeleteChannel: function(commTaskGr) {
        var channelMap = this.getChannelMap();
        for (var channel in channelMap) {
            var commChannelGr = new GlideRecord(channelMap[channel]["inst_table"]);
            commChannelGr.newRecord();
            commChannelGr.setValue(this.TABLES.COMM_TASK.NAME, commTaskGr.getUniqueValue());
            if (commChannelGr.canDelete() && commTaskGr.active) return true;
        }
        return false;
    },

    getRemainingChannels: function(commTaskGr, sourceTable) {
        if (!commTaskGr.isValidRecord()) return [];
        var channels = [];
        var channelMap = this.getChannelMap(sourceTable);
        var commFreqField = this.TABLES.COMM_TASK.FIELDS.COMMUNICATION_FREQUENCY;
        var commTaskFreq = commTaskGr.getValue(commFreqField.NAME);
        var isEmailRemaining = false,
            isSmsRemaining = false;
        for (var channel in channelMap) {
            if (!channelMap[channel].available) continue;
            var hideForRecurringCommTask = commTaskFreq == commFreqField.VALUE.RECURRING && channelMap[channel].hideRecurringFrequency;
            channelMap[channel]["canCreate"] = this.communicationManagementUtil.canCreateChannelOnRelatedInstance(channel, commTaskGr, sourceTable);
            channelMap[channel]["hideForRecurringCommTask"] = hideForRecurringCommTask;
            if (channel == "e-mail" || channel == "sms") {
                var handlerInstance = new sn_comm_management.CommunicationManagementBridgeSNC().getHandlerInstance(sourceTable);
                if (channel == "e-mail") channelMap[channel]["default_email_template_id"] = handlerInstance.DEFAULT_TEMPLATES.EMAIL;
                else channelMap[channel]["default_sms_template_id"] = handlerInstance.DEFAULT_TEMPLATES.SMS;
            }
            channels.push(channelMap[channel]);
        }
        return {
            channels,
            isCollaborateAvailable: this.communicationManagementUtil.getChannelAvailabilityForClassification(sourceTable, 'bridge'),
            commTaskType: this.getExistingChannelTypes(commTaskGr.getUniqueValue())
        };
    },

    canShowMIMTabs: function(table, sysId) {
        if (gs.nil(table) || !gs.tableExists(table) || gs.nil(sysId) || sysId == "-1") {
            return false;
        }

        if (!gs.hasRole('sn_incident_read,itil')) {
            return false;
        }
        var recordGr;

        try {
            recordGr = GlideRecordCache.getOrQuery(table, sysId);
            if (!recordGr || !recordGr.isValidRecord() || !recordGr.canRead())
                return false;
        } catch (e) {
            recordGr = new GlideRecord(table);
            if (!recordGr.get(sysId) || !recordGr.isValidRecord() || !recordGr.canRead())
                return false;
        }

        if (!recordGr || !recordGr[this.TABLES.INCIDENT.FIELDS.MAJOR_INCIDENT_STATE.NAME] || !recordGr[this.TABLES.INCIDENT.FIELDS.MAJOR_INCIDENT_STATE.NAME].canRead()) {
            return false;
        }

        var miState = recordGr.getValue(this.TABLES.INCIDENT.FIELDS.MAJOR_INCIDENT_STATE.NAME);
        if (miState === this.TABLES.INCIDENT.FIELDS.MAJOR_INCIDENT_STATE.VALUE.PROPOSED || miState === this.TABLES.INCIDENT.FIELDS.MAJOR_INCIDENT_STATE.VALUE.ACCEPTED)
            return true;
        else {
            var commPlanGr = new GlideRecord(this.TABLES.INCIDENT_ALERT.NAME);
            commPlanGr.addQuery(this.TABLES.INCIDENT_ALERT.FIELDS.SOURCE_INCIDENT, recordGr.getUniqueValue());
            commPlanGr.setLimit(1);
            commPlanGr.query();
            return (commPlanGr.canRead() && commPlanGr.hasNext());
        }
    },

    canShowCommunicateTab: function(table, sysId) {
        return this.canShowMIMTabs(table, sysId);
    },

    isCollaborateAvailable: function(table) {
        if (gs.nil(table) || !gs.tableExists(table)) return false;
        return this.communicationManagementUtil.getChannelAvailabilityForClassification(table, 'bridge');
    },

    canShowCollaborateTab: function(table, sysId) {
        return this.canShowMIMTabs(table, sysId) && this.isCollaborateAvailable(table);
    },

    getRecipientRoles: function() {
        var roles = {};
        var contactResponsibilityGR = new GlideRecord(this.TABLES.CONTACT_RESPONSIBILITY.NAME);
        contactResponsibilityGR.query();
        while (contactResponsibilityGR.next()) {
            var roleType = contactResponsibilityGR.getValue(this.TABLES.CONTACT_RESPONSIBILITY.FIELDS.TYPE);
            if (!roles[roleType])
                roles[roleType] = [];
            roles[roleType].push({
                id: contactResponsibilityGR.getUniqueValue(),
                label: contactResponsibilityGR.getValue(this.TABLES.CONTACT_RESPONSIBILITY.FIELDS.NAME)
            });
        }
        return roles;
    },

    getInitialManageRecipientModalData: function(table, sysId) {
        if (gs.nil(table) || !gs.tableExists(table) || gs.nil(sysId) || sysId === "-1") return {};

        var sourceTable = null,
            tableType = this._getRootTable(table),
            roles = this.getRecipientRoles();

        var data = {};
        var commPlans = [];
        if (tableType === this.TABLES.TASK.NAME) {
            // In case of task type table, fetching all the comm plans attached to the task record
            sourceTable = table;
            var commPlanGR = new GlideRecord(this.TABLES.COMM_PLAN.NAME);
            commPlanGR.addQuery(this.TABLES.COMM_PLAN.FIELDS.SOURCE, sysId);
            commPlanGR.addQuery(this.TABLES.COMM_PLAN.FIELDS.STATE.NAME, 'IN', [this.TABLES.COMM_PLAN.FIELDS.STATE.VALUE.OPEN, this.TABLES.COMM_PLAN.FIELDS.STATE.VALUE.NEW, this.TABLES.COMM_PLAN.FIELDS.STATE.VALUE.WORK_IN_PROGRESS]); // Supporting both the new and old states
            commPlanGR.query();
            while (commPlanGR.next()) {
                commPlans.push({
                    id: commPlanGR.getUniqueValue(),
                    table: commPlanGR.getValue(this.TABLES.COMM_PLAN.FIELDS.SYS_CLASS_NAME),
                    label: commPlanGR.getValue(this.TABLES.COMM_PLAN.FIELDS.SHORT_DESCRIPTION)
                });
            }
        } else if (tableType === this.TABLES.COMM_PLAN.NAME) {
            // In case of comm_plan type table, fetching the comm plan
            var commPlanGR = new GlideRecord(table);
            commPlanGR.addQuery(this.TABLES.COMM_PLAN.FIELDS.SYS_ID, sysId);
            commPlanGR.addQuery(this.TABLES.COMM_PLAN.FIELDS.STATE.NAME, 'IN', [this.TABLES.COMM_PLAN.FIELDS.STATE.VALUE.OPEN, this.TABLES.COMM_PLAN.FIELDS.STATE.VALUE.NEW, this.TABLES.COMM_PLAN.FIELDS.STATE.VALUE.WORK_IN_PROGRESS]); // Supporting both the new and old states
            commPlanGR.setLimit(1);
            commPlanGR.query();
            if (!commPlanGR.next()) return data;
            sourceTable = commPlanGR.source.sys_class_name + "";
            commPlans.push({
                id: commPlanGR.getUniqueValue(),
                table: commPlanGR.getValue(this.TABLES.COMM_PLAN.FIELDS.SYS_CLASS_NAME),
                label: commPlanGR.getValue(this.TABLES.COMM_PLAN.FIELDS.SHORT_DESCRIPTION)
            });
        }

        data.sourceTable = sourceTable;
        data.tableType = tableType;
        data.roles = roles;
        data.commPlans = commPlans;
        return data;
    },

    getRecipientsSearchResult: function(searchQuery) {
        if (gs.nil(searchQuery)) return {};

        var encodedQuery = null;
        // Searching users
        var users = [];
        var userGR = new GlideRecord(this.TABLES.SYS_USER.NAME);
        userGR.addActiveQuery();
        encodedQuery = "user_nameLIKE" + searchQuery + "^ORnameLIKE" + searchQuery + "^ORmobile_phoneLIKE" + searchQuery + "^ORphoneLIKE" + searchQuery + "^ORemailLIKE" + searchQuery;
        userGR.addEncodedQuery(encodedQuery);
        userGR.setLimit(this.CONSTANTS.MAX_RECIPIENT_SEARCH_RESULTS_PER_TYPE);
        userGR.query();
        while (userGR.next() && userGR.canRead()) {
            var userObj = this._toJS(userGR, [this.TABLES.SYS_USER.FIELDS.NAME, this.TABLES.SYS_USER.FIELDS.AVATAR]);
            userObj.type = this.TABLES.CONTACT.FIELDS.TYPE.VALUE.USER;
            users.push(userObj);
        }

        // Searching user groups
        var userGroups = [];
        var userGroupGR = new GlideRecord(this.TABLES.SYS_USER_GROUP.NAME);
        userGroupGR.addActiveQuery();
        encodedQuery = "nameLIKE" + searchQuery + "^ORemailLIKE" + searchQuery;
        userGroupGR.addEncodedQuery(encodedQuery);
        userGroupGR.setLimit(this.CONSTANTS.MAX_RECIPIENT_SEARCH_RESULTS_PER_TYPE);
        userGroupGR.query();
        while (userGroupGR.next() && userGroupGR.canRead()) {
            var userGroupObj = this._toJS(userGroupGR, [this.TABLES.SYS_USER_GROUP.FIELDS.NAME]);
            userGroupObj.type = this.TABLES.CONTACT.FIELDS.TYPE.VALUE.GROUP;
            userGroups.push(userGroupObj);
        }

        // Searching recipient list
        var recipientLists = [];
        var recipientListGR = new GlideRecord(this.TABLES.SN_PUBLICATIONS_RECIPIENT_LIST.NAME);
        encodedQuery = "nameLIKE" + searchQuery;
        recipientListGR.addEncodedQuery(encodedQuery);
        recipientListGR.setLimit(this.CONSTANTS.MAX_RECIPIENT_SEARCH_RESULTS_PER_TYPE);
        recipientListGR.query();
        while (recipientListGR.next() && recipientListGR.canRead()) {
            var recipientListObj = this._toJS(recipientListGR, [this.TABLES.SN_PUBLICATIONS_RECIPIENT_LIST.FIELDS.NAME]);
            recipientListObj.type = this.TABLES.CONTACT.FIELDS.TYPE.VALUE.RECIPIENT_LIST;
            recipientLists.push(recipientListObj);
        }

        var searchResults = {};
        if (users && users.length)
            searchResults[this.TABLES.SYS_USER.NAME] = users;
        if (userGroups && userGroups.length)
            searchResults[this.TABLES.SYS_USER_GROUP.NAME] = userGroups;
        if (recipientLists && recipientLists.length)
            searchResults[this.TABLES.SN_PUBLICATIONS_RECIPIENT_LIST.NAME] = recipientLists;

        return searchResults;
    },

    getCommPlanRecipients: function(table, sysId) {
        if (gs.nil(table) || !gs.tableExists(table) || gs.nil(sysId) || sysId === "-1") return [];
        var recipients = [];
        var contactGR = new GlideRecord(this.TABLES.CONTACT.NAME);
        contactGR.addQuery(this.TABLES.CONTACT.FIELDS.TABLE, table);
        contactGR.addQuery(this.TABLES.CONTACT.FIELDS.DOCUMENT, sysId);
        contactGR.addEncodedQuery("user.active=true^ORgroup.active=true^ORrecipient_listISNOTEMPTY");
        contactGR.orderBy(this.TABLES.CONTACT.FIELDS.CREATED);
        contactGR.query();
        while (contactGR.next()) {
            var type = contactGR.getValue(this.TABLES.CONTACT.FIELDS.TYPE.NAME);
            var recipientObj = {};
            if (type === this.TABLES.CONTACT.FIELDS.TYPE.VALUE.USER) {
                recipientObj = {
                    id: contactGR.getValue(this.TABLES.CONTACT.FIELDS.USER),
                    label: contactGR.user.name + "",
                    type: type,
                    avatarProps: {
                        userName: contactGR.user.name + "",
                        imageSrc: GlideAvatarFinder.getAvatarPath(contactGR.user.sys_id + "")
                    }
                };
            } else if (type === this.TABLES.CONTACT.FIELDS.TYPE.VALUE.GROUP) {
                recipientObj = {
                    id: contactGR.getValue(this.TABLES.CONTACT.FIELDS.GROUP),
                    label: contactGR.group.name + "",
                    type: type,
                    icon: this.CONSTANTS.ICONS.USER_GROUP_OUTLINE
                };
            } else if (type === this.TABLES.CONTACT.FIELDS.TYPE.VALUE.RECIPIENT_LIST) {
                recipientObj = {
                    id: contactGR.getValue(this.TABLES.CONTACT.FIELDS.RECIPIENT_LIST),
                    label: contactGR.recipient_list.name + "",
                    type: type,
                    icon: this.CONSTANTS.ICONS.USER_GROUP_OUTLINE
                };
            }
            var role = contactGR.getValue(this.TABLES.CONTACT.FIELDS.RESPONSIBILITY);
            if (role) {
                recipientObj.role = {
                    id: role,
                    label: contactGR.responsibility.name + ""
                };
                recipientObj.label += " (" + recipientObj.role.label + ")";
            }
            recipientObj.contactSysId = contactGR.getUniqueValue();
            recipients.push(recipientObj);
        }
        return recipients;
    },

    getUsersFromRecipientList: function(recipientListId, commPlanTable, commPlanSysId, channelType) {
        if (gs.nil(recipientListId) || !gs.tableExists(commPlanTable) || gs.nil(commPlanSysId)) return [];
        var recipientUserIds = [];
        var recipientGr, commPlanGr, commPlanSourceId;
        var needOnCallUsers = (channelType == this.CHANNELS.SMS) ? true : false;
        recipientGr = new GlideRecord(this.TABLES.SN_PUBLICATIONS_RECIPIENT_LIST.NAME);
        if (recipientGr.get(recipientListId)) {
            commPlanGr = new GlideRecord(commPlanTable);
            if (commPlanGr.get(commPlanSysId)) {
                commPlanSourceId = commPlanGr.getValue(this.CONSTANTS.SOURCE);
                if (commPlanSourceId) {
                    var sourceTable = commPlanGr.source.getRefRecord().getRecordClassName();
                    recipientUserIds = new sn_publications.RecipientsListApi().refreshRecepientList(recipientGr, true, {
                        "commPlanSysId": commPlanSysId,
                        "commPlanSourceId": commPlanSourceId,
                        "sourceTable": sourceTable,
                        "needOnCallUsers": needOnCallUsers
                    });
                }
            }
        }
        return recipientUserIds;
    },

    getUsersFromGroups: function(groupSysIds) {
        var groupUsers = [];
        var gr = new GlideRecord(this.TABLES.SYS_USER_GRMEMBER.NAME);
        gr.addQuery("group.sys_id", "IN", groupSysIds);
        gr.query();
        while (gr.next())
            groupUsers.push(gr.getValue(this.TABLES.SYS_USER_GRMEMBER.FIELDS.USER));
        return groupUsers;
    },

    getAggregatedMembers: function(channelRecipeints, commTaskTable, commTaskSysId) {
        if (gs.nil(channelRecipeints) || !gs.tableExists(commTaskTable) || gs.nil(commTaskSysId)) return {};
        var resolvedUsers = {};
        for (var channel in channelRecipeints) {
            if (channelRecipeints.hasOwnProperty(channel)) {
                var userList = channelRecipeints[channel].users,
                    groupList = channelRecipeints[channel].groups,
                    recipientLists = channelRecipeints[channel].recipientLists;
                var aggregatedMembers = [];
                if (groupList)
                    aggregatedMembers = aggregatedMembers.concat(this.getUsersFromGroups(groupList.join(",")));
                if (userList)
                    aggregatedMembers = aggregatedMembers.concat(userList);
                if (recipientLists) {
                    var commTaskGR = new GlideRecord(commTaskTable);
                    if (commTaskGR.get(commTaskSysId)) {
                        var commPlanSysId = commTaskGR.getValue(this.CONSTANTS.COMM_PLAN);
                        if (commPlanSysId) {
                            var commPlanTable = commTaskGR.comm_plan.getRefRecord().getRecordClassName();
                            for (var i = 0; i < recipientLists.length; i++)
                                aggregatedMembers = aggregatedMembers.concat(this.getUsersFromRecipientList(recipientLists[i], commPlanTable, commPlanSysId));
                        }
                    }
                }
                resolvedUsers[channel] = this._getUnique(aggregatedMembers);
            }
        }
        return resolvedUsers;
    },

    _getSMSfromUserIds: function(userList) {
        var smsContacts = [];
        var notifyUtils = (GlidePluginManager.isActive('com.snc.notify')) ? new global.NotifyUtils() : null;
        if (!notifyUtils)
            return smsContacts;
        for (var i = 0; i < userList.length; i++) {
            var numbers = notifyUtils.getUniquePhoneNumbersForUsersAndGroups([], [userList[i]], [], notifyUtils.numberType.sms);
            smsContacts = smsContacts.concat(numbers);
        }
        return smsContacts;
    },

    getAggregatedSMSNumbers: function(commTaskTable, commTaskSysId, channelRecipeints) {
        if (gs.nil(channelRecipeints) || gs.nil(commTaskSysId) || !gs.tableExists(commTaskTable))
            return [];

        var smsContacts = [],
            resolvedUserList = [];

        var comMangementUtils = this.communicationManagementUtil;
        var commTaskGR = new GlideRecord(commTaskTable);
        var commPlanSysId;
        if (commTaskGR.get(commTaskSysId) && commTaskGR.isValidRecord()) {
            var commPlanSysId = commTaskGR.getValue(this.CONSTANTS.COMM_PLAN);
            var handlerInstance, maxContactLimitProperty, maxContactLimit = comMangementUtils.MAX_DEFAULT_SMS,
                smsContactsLength = 0;
            if (commPlanSysId) {
                var commPlanGR = commTaskGR.comm_plan.getRefRecord();
                var commPlanTable = commPlanGR.getRecordClassName();
                if (commPlanTable == 'incident_alert') {
                    handlerInstance = new sn_comm_management.CommunicationManagementBridgeSNC().getHandlerInstance(this.TABLES.INCIDENT);
                } else {
                    handlerInstance = new sn_comm_management.CommunicationManagementBridgeSNC().getHandlerInstance(commPlanGR.source.getRefRecord().getRecordClassName());
                }
                maxContactLimitProperty = handlerInstance.PROPERTIES.MAX_CONTACT_LIMIT_SMS;
                maxContactLimit = Number(gs.getProperty(maxContactLimitProperty, maxContactLimit)) + 1;
            }

            var userList = channelRecipeints.users,
                groupList = channelRecipeints.groups,
                recipientLists = channelRecipeints.recipientLists;
            var i = 0;

            if (userList) {
                if (userList.length > (maxContactLimit - smsContactsLength))
                    userList = userList.slice(0, (maxContactLimit - smsContactsLength));
                resolvedUserList = resolvedUserList.concat(userList);
                smsContactsLength = smsContactsLength + userList.length;
            }

            while (smsContactsLength < maxContactLimit && groupList && i < groupList.length) {
                var groupGr = this._getRecordBySysID(this.TABLES.SYS_USER_GROUP.NAME, groupList[i]);
                if (groupGr) {
                    var onCallUsers = comMangementUtils.getOnCallResourcesForGroup(groupGr, commPlanSysId);
                    if (onCallUsers.length > (maxContactLimit - smsContactsLength))
                        onCallUsers = onCallUsers.slice(0, (maxContactLimit - smsContactsLength));

                    for (var j = 0; j < onCallUsers.length; j++) {
                        resolvedUserList.push(onCallUsers[j].id);
                        smsContactsLength++;
                    }
                }
                i++;
            }
            i = 0;
            while (smsContactsLength < maxContactLimit && recipientLists && i < recipientLists.length) {
                var recipientUsersList = this.getUsersFromRecipientList(recipientLists[i], commPlanTable, commPlanSysId, this.CHANNELS.SMS);
                if (recipientUsersList.length > (maxContactLimit - smsContactsLength))
                    recipientUsersList = recipientUsersList.slice(0, (maxContactLimit - smsContactsLength));
                resolvedUserList = resolvedUserList.concat(recipientUsersList);
                smsContactsLength = smsContactsLength + recipientUsersList.length;
                i++;
            }

            if (smsContactsLength == maxContactLimit) {
                resolvedUserList.pop();
            }
            smsContacts = this._getSMSfromUserIds(resolvedUserList);
        }
        return smsContacts;
    },

    getNotifySMSTemplateMessage: function(table, id, templateId) {
        var commTaskGR = this._getRecordBySysID(table, id);
        var smsTemplateGR = this._getRecordBySysID(this.communicationManagementUtil.TABLES.NOTIFY_SMS_TEMPLATE, templateId);
        if (gs.nil(smsTemplateGR) || gs.nil(smsTemplateGR.template)) return "";
        var message = this.communicationManagementUtil.notifyUtils.formatContent(commTaskGR, smsTemplateGR.template);
        return this.communicationManagementUtil.notifyUtils.expandVariables(message, commTaskGR);
    },

    _getUserByID: function(id) {
        return this._getRecordBySysID('sys_user', id);
    },

    _getRecordBySysID: function(table, id) {
        var record = new GlideRecord(table);
        if (record.get(id))
            return record;
    },

    _getRootTable: function(table) {
        if (gs.nil(table) || !gs.tableExists(table)) return null;
        return new GlideTableHierarchy(table).getRoot();
    },

    _toJS: function(gr, fields) {
        var obj = {
            id: gr.getUniqueValue()
        };
        fields.forEach(function(field) {
            obj[field] = gr.getValue(field);
        });
        return obj;
    },

    _getUnique: function(arr) {
        var obj = {},
            arrLen = arr.length;
        for (var i = 0; i < arrLen; i++)
            obj[arr[i]] = true;
        return Object.keys(obj);
    },

    type: 'CommunicationManagementUXFBaseUtilSNC'
};
