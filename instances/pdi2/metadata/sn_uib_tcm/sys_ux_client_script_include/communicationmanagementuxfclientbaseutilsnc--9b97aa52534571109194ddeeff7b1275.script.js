function include({
    imports
}) {
    class CommunicationManagementUXFClientBaseUtilSNC {
        static CONSTANTS = {
            ICONS: {
                USER_GROUP_OUTLINE: "user-group-outline"
            },
            SEARCH_RESULT_LIST_TYPE_TITLE_MAP: {
                sys_user: "Users",
                sys_user_group: "Groups",
                sn_publications_recipients_list: "Recipient Lists"
            },
            CONTACT_TYPE_COLUMN_MAP: {
                sys_user: "user",
                sys_user_group: "group",
                sn_publications_recipients_list: "recipient_list"
            }
        };
        static TABLES = {
            SYS_USER: "sys_user",
            SYS_USER_GROUP: "sys_user_group",
            SN_PUBLICATIONS_RECIPIENT_LIST: "sn_publications_recipients_list"
        };

        static processRecipientsForDropdown(type, recipients, ignoreAvatar = false) {
            const processedRecipients = [];
            const commMgmtUXFBaseUtil = this;
            recipients.forEach(function(recipient) {
                let searchResultObj = {
                    id: recipient.id,
                    label: recipient.name,
                    type: recipient.type
                };
                if (recipient.type === commMgmtUXFBaseUtil.TABLES.SYS_USER) {
                    if (!ignoreAvatar) {
                        searchResultObj.avatarProps = {
                            userName: recipient.name,
                            imageSrc: recipient.avatar ? recipient.avatar + ".iix" : "",
                        };
                    }
                } else if (recipient.type === commMgmtUXFBaseUtil.TABLES.SYS_USER_GROUP || recipient.type === commMgmtUXFBaseUtil.TABLES.SN_PUBLICATIONS_RECIPIENT_LIST) {
                    if (!ignoreAvatar)
                        searchResultObj.icon = commMgmtUXFBaseUtil.CONSTANTS.ICONS.USER_GROUP_OUTLINE;
                }
                processedRecipients.push(searchResultObj);
            });
            const processedRecipientsObj = {
                id: type,
                children: processedRecipients
            };
            if (commMgmtUXFBaseUtil.CONSTANTS.SEARCH_RESULT_LIST_TYPE_TITLE_MAP[type]) {
                processedRecipientsObj.label = commMgmtUXFBaseUtil.CONSTANTS.SEARCH_RESULT_LIST_TYPE_TITLE_MAP[type];
            }
            return processedRecipientsObj;
        };

        static processAddRecipientList(addList) {
            for (let i = 0; i < addList.length; i++) {
                var newRecipientObj = {
                    type: {
                        value: addList[i].type
                    }
                };
                if (addList[i].role && addList[i].role.id) {
                    newRecipientObj.responsibility = {
                        value: addList[i].role.id,
                        display_value: addList[i].role.label
                    };
                }
                if (this.CONSTANTS.CONTACT_TYPE_COLUMN_MAP[addList[i].type]) {
                    newRecipientObj[this.CONSTANTS.CONTACT_TYPE_COLUMN_MAP[addList[i].type]] = {
                        value: addList[i].id,
                        display_value: addList[i].label
                    }
                }
                addList[i] = newRecipientObj;
            }
        };

        static processDeleteRecipientList(deleteList) {
            for (let i = 0; i < deleteList.length; i++) {
                deleteList[i] = deleteList[i].contactSysId;
            }
        };

        static evaluateAddDeleteRecipientList(existingRecipients, currentRecipients) {
            const existingRecipientsObj = this._buildRecipientsObjFromList(existingRecipients);
            const currentRecipientsObj = this._buildRecipientsObjFromList(currentRecipients);
            const deleteList = this._findOrderedSetDifferenceBFromA(existingRecipients, currentRecipientsObj);
            const addList = this._findOrderedSetDifferenceBFromA(currentRecipients, existingRecipientsObj);

            return {
                addList: addList,
                deleteList: deleteList
            };
        };

        static _buildRecipientsObjFromList(recipientsList) {
            const recipientsObj = {};
            recipientsList.forEach(function(recipient) {
                let uniqueRecipientId = recipient.id;
                if (recipient.role && recipient.role.id) {
                    uniqueRecipientId += ".";
                    uniqueRecipientId += recipient.role.id;
                }
                recipientsObj[uniqueRecipientId] = recipient;
            });
            return recipientsObj;
        };

        static _findOrderedSetDifferenceBFromA(AList, BObj) {
            const orderedDifference = [];
            for (let i = 0; i < AList.length; i++) {
                let uniqueId = AList[i].id;
                if (AList[i].role && AList[i].role.id) {
                    uniqueId += ".";
                    uniqueId += AList[i].role.id;
                }
                if (!BObj[uniqueId]) {
                    orderedDifference.push(AList[i]);
                }
            }
            return orderedDifference;
        };

        static getChannelRecipients(recipients) {
            var channelRecipients = [];
            for (var i = 0; i < recipients.length; i++) {
                let recipient = {
                    'id': recipients[i]['id'],
                    'label': recipients[i]['name']['display_value'],
                    'sublabel': recipients[i]['email']['display_value'],
                };
                channelRecipients.push(recipient);
            }
            return channelRecipients;
        };

        static populateSearchResult(recipients) {
            if (!recipients) return [];
            let searchResults = [];
            for (let type in recipients) {
                searchResults.push(this.processRecipientsForDropdown(type, recipients[type], true));
            }
            return searchResults;
        };

        static filterCommTasks(commTaskGroups, currentFilters, tabType) {
            if (!currentFilters || !currentFilters.length || !commTaskGroups || !commTaskGroups.length || !tabType) return;
            let filterMap = Object.fromEntries(
                currentFilters.map((filterId) => [filterId, true])
            );
            for (var i = 0; i < commTaskGroups.length; i++) {
                var commTasks = commTaskGroups[i].comm_tasks || [];
                var numOfVisibleTasks = commTasks.length;
                for (var j = 0; j < commTasks.length; j++) {
                    if (commTasks[j].adhoc) commTasks[j].commPlanSysId = "ad_hoc_communications";
                    var hide =
                        (tabType === "Communicate" &&
                            !filterMap[commTasks[j].commPlanSysId] &&
                            !filterMap["all"]) ||
                        (tabType === "Collaborate" &&
                            filterMap["chat"] &&
                            !filterMap["all"] &&
                            !commTasks[j].channels[0].is_collaboration_chat) ||
                        (tabType === "Collaborate" &&
                            filterMap["calls"] &&
                            !filterMap["all"] &&
                            commTasks[j].channels[0].channelType.value != "conference");
                    commTaskGroups[i].comm_tasks[j]["hide"] = hide;
                    if (hide) numOfVisibleTasks--;
                }
                commTaskGroups[i]["hide"] = numOfVisibleTasks <= 0;
                commTaskGroups[i]["visibleTasks"] = Math.max(numOfVisibleTasks, 0);
            }
            return commTaskGroups;
        }
        
    };

    return CommunicationManagementUXFClientBaseUtilSNC;
}
