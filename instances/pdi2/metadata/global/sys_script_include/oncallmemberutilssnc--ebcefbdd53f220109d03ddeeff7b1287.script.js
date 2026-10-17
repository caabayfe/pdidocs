var OnCallMemberUtilsSNC = Class.create();
OnCallMemberUtilsSNC.prototype = {
    initialize: function() {

        this.TABLES = {
            CMN_ROTA: 'cmn_rota',
            CMN_ROTA_ROSTER: 'cmn_rota_roster',
            CMN_ROTA_MEMBER: 'cmn_rota_member',
            SYS_USER_GRMEMBER: 'sys_user_grmember'
        };
    },

    getRostersWithMembers: function(rotaSysId, gd) {
        var rosters = [];
        if (!gd)
            gd = new GlideDate();
        var rosterGr = new GlideRecord(this.TABLES.CMN_ROTA_ROSTER);
        rosterGr.addActiveQuery();
        rosterGr.addQuery('rota', rotaSysId);
        rosterGr.orderBy('order');
        rosterGr.query();

        while (rosterGr.next()) {
            var roster = {
                name: rosterGr.name + "",
                members: []
            };
            var memberGr = new GlideRecord(this.TABLES.CMN_ROTA_MEMBER);
            memberGr.addQuery('roster', rosterGr.getUniqueValue());
            memberGr.orderBy('from');
            memberGr.orderBy('order');
            memberGr.query();
            while (memberGr.next()) {
                roster.members.push({
                    name: memberGr.getDisplayValue('member'),
                    to: memberGr.getDisplayValue('to'),
                    from: memberGr.getDisplayValue('from'),
                    order: memberGr.getDisplayValue('order')
                });
            }
            rosters.push(roster);
        }
        return rosters;
    },

    getRefQualByRoster: function(rosterSysId, fromDate) {
        var gd = new GlideDate().getValue();
        if (fromDate)
            gd = fromDate + "";
        return 'sys_idIN' + this.getActiveMemberUserIds(rosterSysId, gd, false).join(',');
    },

    getNonMembersRefQualByRoster: function(rosterSysId, fromDate) {
        var gd = new GlideDate().getValue();
        if (fromDate)
            gd = fromDate + "";
        var userIds = [];
        var activeMembers = this.getActiveMemberUserIds(rosterSysId, gd, false).join(',');

        var rosterGr = new GlideRecord(this.TABLES.CMN_ROTA_ROSTER);
        rosterGr.get(rosterSysId);

        var grMembers = new GlideRecord(this.TABLES.SYS_USER_GRMEMBER);
        grMembers.setWorkflow(false);
        grMembers.addQuery('group', rosterGr.rota.group);
        grMembers.addQuery('user', 'NOT IN', activeMembers);
        grMembers.query();

        while (grMembers.next()) {
            userIds.push(grMembers.user.sys_id);
        }
        return 'sys_idIN' + userIds.join(',');
    },

    handleMoveMember: function (current) {
        var fromUser = current.source_user + '';
        var toUser = current.target_user + '';
        var rotaSysId = current.rota + '';
        var rosterIds = current.rosters + '';
        rosterIds = rosterIds.split(',');
        var fromDateGd = current.from_date.getGlideObject();
        var type = current.type + '';

        if (!fromDateGd)
            fromDateGd = new GlideDate();

        var rosterGr = this._getRosters(rotaSysId, rosterIds);

        while (rosterGr.next()) {
            var rosterMemberGr = this._getRosterMembers(rosterGr, fromDateGd, true);
            var membersInOrder = [];
            var fromUserIndex = null;
            var toUserIndex = null;
            var index = 0;
            while (rosterMemberGr.next()) {
                var member = {
                    roster: rosterMemberGr.roster + '',
                    member: rosterMemberGr.member + '',
                    order: rosterMemberGr.order + '',
                    sys_id: rosterMemberGr.getUniqueValue()
                };

                if (rosterMemberGr.getValue('to')) {
                    member.to = rosterMemberGr.getValue('to');
                }
                membersInOrder.push(member);
                if (rosterMemberGr.member + '' == fromUser) {
                    fromUserIndex = index;
                }
                if (rosterMemberGr.member + '' == toUser) {
                    toUserIndex = index;
                }
                index++;
            }

            if (fromUserIndex === null && toUserIndex === null)
                return;

            // End all user on date;
            var memberIds = [];
            membersInOrder.forEach(function(member) {
                memberIds.push(member.sys_id);
            });

            var isUpdatingOnSameDayObj = {};

            var nextDate = new GlideDate();
            nextDate.setValue(fromDateGd.getValue());
            nextDate.addDays(-1);

            rosterMemberGr = new GlideRecord(this.TABLES.CMN_ROTA_MEMBER);
            rosterMemberGr.addQuery('sys_id', memberIds);
            rosterMemberGr.query();
            while (rosterMemberGr.next()) {
                if (fromDateGd.getValue() + '' == rosterMemberGr.getValue('from')) {
                    isUpdatingOnSameDayObj[rosterMemberGr.sys_id] = true;
                } else {
                    rosterMemberGr.setWorkflow(false);
                    rosterMemberGr.setValue('to', nextDate.getValue());
                    rosterMemberGr.update();
                }
            }

            // Create new members

            if (type == 'swap') {
                var temp = membersInOrder[fromUserIndex].order;
                membersInOrder[fromUserIndex].order = membersInOrder[toUserIndex].order;
                membersInOrder[toUserIndex].order = temp;
            } else if (type === 'move_after') {
                var targetOrder = parseInt(membersInOrder[toUserIndex].order);
                membersInOrder[fromUserIndex].order = targetOrder + 100;
                for (i = toUserIndex + 1; i < membersInOrder.length && i != fromUserIndex; i++) {
                    membersInOrder[i].order = parseInt(membersInOrder[i].order) + 100;
                }
            }

            membersInOrder.forEach(function(rosterMember) {
                var isUpdatingOnSameDay = !!isUpdatingOnSameDayObj[rosterMember.sys_id];
                var newRosterMemberGr = new GlideRecord(this.TABLES.CMN_ROTA_MEMBER);
                if (isUpdatingOnSameDay) {
                    newRosterMemberGr.get(rosterMember.sys_id);
                    newRosterMemberGr.setWorkflow(false);
                    newRosterMemberGr.setValue('order', rosterMember.order);
                    newRosterMemberGr.update();
                } else {
                    newRosterMemberGr.setValue('roster', rosterMember.roster);
                    newRosterMemberGr.setValue('member', rosterMember.member);
                    newRosterMemberGr.setValue('order', rosterMember.order);
                    newRosterMemberGr.setValue('from', fromDateGd.getValue());
                    if (rosterMember.to) {
                        newRosterMemberGr.setValue('to', rosterMember.to);
                    }
                    newRosterMemberGr.setWorkflow(false);
                    newRosterMemberGr.insert();
                }
            }.bind(this));
			
        }
		
        var rotaGr = current.rota.getRefRecord();
		var ocRota = new OnCallRotation();
        if (ocRota.canAutoUpgradeToNewScheduleEngine(rotaGr)) {
			ocRota.upgradeShiftToNewScheduleEngine(rotaGr);
		} else {
            var updatedRosterGr = this._getRosters(rotaSysId, rosterIds);
            while (updatedRosterGr.next()) {
                var ocRoster = new OnCallRoster(updatedRosterGr);
                if (ocRota.isShiftOnOldEngine(rotaGr)) {
                    ocRoster.computeRotationSchedules();
                } else {
                    ocRoster.updateRotationPayload();
                }
            }
        }

    },

    handleRemoveUser: function (current) {
        var rotaSysId = current.rota + '';
        var userGr = current.user.getRefRecord();
        var rosterIds = current.rosters + '';
        rosterIds = rosterIds.split(',');
        var fromDateGd = current.from_date.getGlideObject();
        fromDateGd.addDays(-1);
        var deleteMember = current.delete_member;

        if (!rotaSysId || !rosterIds || !userGr || !fromDateGd) {
            return;
        }

        if (deleteMember) {
            var rosterGr = new GlideRecord(this.TABLES.CMN_ROTA_MEMBER);
            rosterGr.addQuery('roster', 'IN', current.rosters + '');
            rosterGr.addQuery('member', userGr.getUniqueValue());
            rosterGr.deleteMultiple();
            return;
        }

        var rosterGr = this._getRosters(rotaSysId, rosterIds);

        var rosterMembersMap = {};
        var baseRosterMembers = [];
        while (rosterGr.next()) {

            var isUserActiveRosterMember = this._isUserActiveRosterMember(rosterGr, fromDateGd, userGr);
            if (!isUserActiveRosterMember) {
                continue;
            }

            rosterMembersMap[rosterGr.getUniqueValue()] = [];

            var rosterMembersDetails = this.getRemainingRosterMembersDetails(rosterGr, userGr, fromDateGd);
            var rosterMembers = rosterMembersDetails.remainingUsers;
            var newMembersOrder = rosterMembersDetails.newMembersOrder;

            if (baseRosterMembers.length == 0) {
                baseRosterMembers = rosterMembers;
                rosterMembersMap[rosterGr.getUniqueValue()] = rosterMembers;
            } else {
                if (baseRosterMembers.length == rosterMembers.length) {
                    var matchedMembers = 0;
                    baseRosterMembers.forEach(function(baseRosterMember) {
                        rosterMembers.forEach(function(rosterMember) {
                            if (rosterMember.member == baseRosterMember.member) {
                                matchedMembers++;
                            }
                        });
                    });
                    if (matchedMembers == rosterMembers.length) {
                        //all members matched
                        rosterMembersMap[rosterGr.getUniqueValue()] = rosterMembers;
                    }
                }
            }
        }

        /**update to date of removed user in all rosters */
        this.updateToDateOfRemovedUser(Object.keys(rosterMembersMap), userGr, fromDateGd);

        /**update to date of remaining members in all rosters */

        var rosterMemberSysIds = [];
        for (var roster in rosterMembersMap) {
            var rosterMembers = rosterMembersMap[roster];
            rosterMembers.forEach(function (rosterMember) {
                rosterMemberSysIds.push(rosterMember.sys_id);
            });
        }

        // Remaining users
        this.updateToDateOfUsers(rosterMemberSysIds, fromDateGd);

        var currentPosition = 0;
        for (var roster in rosterMembersMap) {
            var rosterMembers = rosterMembersMap[roster];
            //  rosterMembers = rosterMembers.concat(rosterMembers.splice(0, currentPosition));

            rosterMembers.forEach(function(rosterMember) {
                rosterMember.order = (((newMembersOrder.length + newMembersOrder.indexOf(rosterMember.member + "") - currentPosition) % newMembersOrder.length) + 1) * 100;
                //  rosterStartOrder++;
            });

            rosterMembersMap[roster] = rosterMembers;
            currentPosition++;
        }

        /*create new rota member records */

        var nextDate = new GlideDate();
        nextDate.setValue(fromDateGd.getValue());
        nextDate.addDays(1);

        for (var roster in rosterMembersMap) {
            var rosterMembers = rosterMembersMap[roster];

            rosterMembers.forEach(function(rosterMember) {
                var newRosterMemberGr = new GlideRecord(this.TABLES.CMN_ROTA_MEMBER);
                newRosterMemberGr.setValue('roster', rosterMember.roster);
                newRosterMemberGr.setValue('member', rosterMember.member);
                newRosterMemberGr.setValue('order', rosterMember.order);
                newRosterMemberGr.setValue('from', nextDate.getValue());
                if (rosterMember.to) {
                    newRosterMemberGr.setValue('to', rosterMember.to);
                }
                newRosterMemberGr.setWorkflow(false);
                newRosterMemberGr.insert();
            }.bind(this));
        }

        var members = new GlideRecord(this.TABLES.CMN_ROTA_MEMBER);
        members.addQuery('roster', 'IN', current.rosters + '');
        members.addQuery("member", current.user + '');
        members.addEncodedQuery('from=NULL^ORfrom>='+current.from_date.getValue());
        members.addEncodedQuery('to=NULL^ORto>'+current.from_date.getValue());
        members.setWorkflow(false);
        members.deleteMultiple();

        var rotaGr = current.rota.getRefRecord();
        var ocRota = new OnCallRotation();
        if (ocRota.canAutoUpgradeToNewScheduleEngine(rotaGr)) {
			ocRota.upgradeShiftToNewScheduleEngine(rotaGr);
		} else {
            var updatedRosterGr = this._getRosters(rotaSysId, rosterIds);
            while (updatedRosterGr.next()) {
                var ocRoster = new OnCallRoster(updatedRosterGr);
                if (ocRota.isShiftOnOldEngine(rotaGr)) {
                    ocRoster.computeRotationSchedules();
                } else {
                    ocRoster.updateRotationPayload();
                }
            }
        }

    },

    _getRosters: function (rotaSysId, rosterIds) {
        var rosterGr = new GlideRecord(this.TABLES.CMN_ROTA_ROSTER);
        rosterGr.addQuery("sys_id", rosterIds);
        rosterGr.addQuery('rota', rotaSysId);
        rosterGr.orderBy('order');
        rosterGr.query();
        return rosterGr;

    },

    _isUserActiveRosterMember: function (rosterGr, endDateGd, userGr) {
        var memberGr = new GlideRecord(this.TABLES.CMN_ROTA_MEMBER);
        var gd = endDateGd.getDate().getValue();
        memberGr.addQuery('roster', rosterGr.getUniqueValue());
        memberGr.addEncodedQuery("from=NULL^ORfrom<=" + gd);
        memberGr.addEncodedQuery("to=NULL^ORto>" + gd);
        memberGr.addQuery("member", userGr.getUniqueValue());
        memberGr.query();
        return memberGr.hasNext();

    },

    getRemainingRosterMembersDetails: function (rosterGr, userGr, endDateGd) {
        var removedUserId = userGr.getUniqueValue();
        var rosterMemberGr = this._getRosterMembers(rosterGr, endDateGd);
        var remainingUsers = [];
        var usersBeforeRemovedUser = [];
        var usersAfterRemovedUser = [];

        var removeUserFound = false;
        while (rosterMemberGr.next()) {
            var rosterMemberId = rosterMemberGr.member + '';
            if (rosterMemberId == removedUserId)
                removeUserFound = true;

            if (rosterMemberId != removedUserId) {
                var remainingUser = {
                    roster: rosterMemberGr.roster + '',
                    member: rosterMemberGr.member + '',
                    order: rosterMemberGr.order + '',
                    to: rosterMemberGr.to + '',
                    sys_id: rosterMemberGr.getUniqueValue()
                };

                if (rosterMemberGr.getValue('to')) {
                    remainingUser.to = rosterMemberGr.getValue('to');
                }
                remainingUsers.push(remainingUser);

                if (removeUserFound) {
                    usersAfterRemovedUser.push(remainingUser.member);
                } else {
                    usersBeforeRemovedUser.push(remainingUser.member);
                }

            }
        }

        return {
            remainingUsers: remainingUsers,
            newMembersOrder: usersAfterRemovedUser.concat(usersBeforeRemovedUser)
        };
    },

    _getRosterMembers: function (rosterGr, endDateGd, includingEndDate) {
        var memberGr = new GlideRecord(this.TABLES.CMN_ROTA_MEMBER);
        var gd = endDateGd.getDate().getValue();
        memberGr.addQuery('roster', rosterGr.getUniqueValue());
        memberGr.addEncodedQuery("from=NULL^ORfrom<=" + gd);
        if (includingEndDate)
            memberGr.addEncodedQuery("to=NULL^ORto>=" + gd);
        else
            memberGr.addEncodedQuery("to=NULL^ORto>" + gd);
        memberGr.orderBy('order');
        memberGr.query();
        return memberGr;
    },

    updateToDateOfRemovedUser: function (rosters, userGr, endDateGd) {
        var memberGr = new GlideRecord(this.TABLES.CMN_ROTA_MEMBER);
        var gd = endDateGd.getDate().getValue();
        memberGr.addQuery('roster', 'IN', rosters.join(','));
        memberGr.addQuery('member', userGr.getUniqueValue());
        memberGr.addEncodedQuery("from=NULL^ORfrom<=" + gd);
        memberGr.addEncodedQuery("to=NULL^ORto>" + gd);
        memberGr.orderBy('order');
        memberGr.query();

        while (memberGr.next()) {
            memberGr.setWorkflow(false);
            memberGr.setValue('to', endDateGd.getValue());
            memberGr.update();
        }
    },

    updateToDateOfUsers: function (rosterMembers, endDateGd) {
        if (!rosterMembers) {
            rosterMembers = [];
        }

        var rosterMemberGr = new GlideRecord(this.TABLES.CMN_ROTA_MEMBER);
        rosterMemberGr.addQuery('sys_id', 'IN', rosterMembers.join(','));
        rosterMemberGr.query();
        while (rosterMemberGr.next()) {
            rosterMemberGr.setWorkflow(false);
            rosterMemberGr.setValue('to', endDateGd.getValue());
            rosterMemberGr.update();
        }
    },

    handleAddMember: function (current) {
        var fromDate = current.from_date + "";
        var rotaId = current.rota + "";
        var rotaGr = new GlideRecord(this.TABLES.CMN_ROTA);
        rotaGr.get(rotaId);
        var rosterIds = current.rosters + "";
        var addAfterMember = current.add_after + "";
        rosterIds = rosterIds.split(',');

        if (!addAfterMember) {
            var currentRosterId = current.current_roster + "";
            var currentRosterMembersGr = new GlideRecord(this.TABLES.CMN_ROTA_MEMBER);
            currentRosterMembersGr.addQuery('roster', currentRosterId);
            currentRosterMembersGr.addEncodedQuery("to=NULL^ORto>=" + fromDate);
            currentRosterMembersGr.orderByDesc("order");
            currentRosterMembersGr.query();

            while (currentRosterMembersGr.next()) {
                addAfterMember = currentRosterMembersGr.member + "";
                break;
            }
        }

        for (var i = 0; i < rosterIds.length; i++) {
            var rosterId = rosterIds[i];
            var rosterGr = new GlideRecord(this.TABLES.CMN_ROTA_ROSTER);
            rosterGr.get(rosterId);
            var memberGr = new GlideRecord(this.TABLES.CMN_ROTA_MEMBER);
            memberGr.addQuery('roster', rosterId);
            memberGr.addEncodedQuery("to=NULL^ORto>=" + fromDate);
            memberGr.orderBy("order");
            memberGr.query();

            var created = false;
            var currentOrder = 100;
            var newMemberGr = new GlideRecord(this.TABLES.CMN_ROTA_MEMBER);
            newMemberGr.initialize();
            newMemberGr.member = current.member + "";
            newMemberGr.from = fromDate;
            newMemberGr.roster = rosterId;
            while (memberGr.next()) {
                currentOrder = parseInt(memberGr.order + "");
                if (!created) {
                    if (memberGr.member + '' === addAfterMember) {
                        newMemberGr.order = currentOrder + 100;
                        created = true;
                    }
                } else {
                    memberGr.order = currentOrder + 100;
                    memberGr.setWorkflow(false);
                    memberGr.update();
                }
            }
            if (!created) {
                newMemberGr.order = currentOrder + 100;
            }

            var updatedMemberGr = new GlideRecord(this.TABLES.CMN_ROTA_MEMBER);
            updatedMemberGr.addQuery('member', newMemberGr.member);
            updatedMemberGr.addEncodedQuery('from>' + newMemberGr.from);
            updatedMemberGr.orderBy('from');
            updatedMemberGr.query();
            if (updatedMemberGr.hasNext()) {
                var prevDay = updatedMemberGr.from.getGlideObject();
                prevDay.addDays(-1);
                newMemberGr.to = prevDay;
            }
            newMemberGr.insert();
        }

    },

    getSimilarRosters: function (rosterSysId, gd) {
        var sourceActiveMembers = this.getActiveMemberUserIds(rosterSysId, gd.getValue(), true);
        var sourceRosterGr = new GlideRecord(this.TABLES.CMN_ROTA_ROSTER);
        if (!sourceRosterGr.get(rosterSysId))
            return;

        var rotaSysId = sourceRosterGr.rota + "";

        var rosterGr = new GlideRecord(this.TABLES.CMN_ROTA_ROSTER);
        rosterGr.addActiveQuery();
        rosterGr.addQuery('rota', rotaSysId);
        rosterGr.addQuery('sys_id', '!=', rosterSysId);
        rosterGr.query();

        var similarRosters = [];
        while (rosterGr.next()) {
            var activeMembers = this.getActiveMemberUserIds(rosterGr.getUniqueValue(), gd.getValue(), true);
            if (sourceActiveMembers.length === activeMembers.length) {
                var activeMembersMap = {};
                activeMembers.forEach(function (activeMember) {
                    activeMembersMap[activeMember] = true;
                });
                var flag = true;
                for (var i = 0; i < sourceActiveMembers.length; i++) {
                    if (!activeMembersMap[sourceActiveMembers[i]]) {
                        flag = false;
                        break;
                    }
                }
                if (flag)
                    similarRosters.push(rosterGr.getUniqueValue());
            }
        }

        return similarRosters;
    },

    getActiveMemberUserIds: function (rosterSysId, gd, includeFutureUser) {
        if (!gd)
            gd = new GlideDate().getValue();
        var rosterGr = this.getActiveMembersGr(rosterSysId, gd, includeFutureUser);
        var userIds = [];
        while (rosterGr.next()) {
            userIds.push(rosterGr.member + '');
        }
        return userIds;
    },

    getActiveMembersGr: function (rosterSysId, dateStr, includeFutureUser) {
        var memberGr = new GlideRecord(this.TABLES.CMN_ROTA_MEMBER);
        memberGr.addQuery('roster', rosterSysId);
        if (!includeFutureUser)
            memberGr.addEncodedQuery("from=NULL^ORfrom<=" + dateStr);
        memberGr.addEncodedQuery("to=NULL^ORto>=" + dateStr);
        memberGr.query();
        return memberGr;
    },

    type: 'OnCallMemberUtilsSNC'
};
