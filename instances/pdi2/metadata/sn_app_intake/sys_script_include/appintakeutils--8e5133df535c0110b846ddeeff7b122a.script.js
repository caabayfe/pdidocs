var AppIntakeUtils = Class.create();
AppIntakeUtils.prototype = {
    initialize: function() {},

    /**
     * Creates JSON object from GlideRecord Object
     * @param {GlideRecord} gr
     * @param {Array} [fields] if fields is not passed in, function will return all fields
     * @returns {Object}
     */
    getObjectFromGlideRecord: function(gr, fields) {
        if (!gr) {
            return {};
        }

        var isNonEmptyArray = Array.isArray(fields) && fields.length > 0;
        var resultObj = {};

        if (isNonEmptyArray) {
            fields.forEach(function(field) {
                resultObj[field] = gr.getValue(field);
            });
        } else {
            for (var prop in gr) {
                if (gr[prop]) {
                    resultObj[prop] = gr.getValue(prop);
                }
            }
        }

        return resultObj;
    },

    /**
     * Add user to group or groups
     * If user already exists on dev instance, activate user and then add them to the specified group or groups
     * 
     * @param {Object} user
     * @param {string} permissionType
     * @returns {Object}
     */
    addUserToGroup: function(user, permissionType) {
        var userRecord = this.getUser(user.user_name);
        var groups = permissionType.split(',');
        var invalidGroups = this.getInvalidGroups(groups);
        var insertGroupResult;

        // Return list of invalid group sysIds to caller for notification
        if (invalidGroups.length > 0) {
            throw new sn_ws_err.ServiceError()
                .setStatus(404)
                .setMessage(gs.getMessageLang("Attempting to add users to invalid groups", "en"))
                .setDetail(gs.getMessage("Group sys_ids not found on instance: {0}", invalidGroups.join(', ')));
        }

        // Check to see if user currently exists
        if (userRecord) {
            userRecord.setValue('active', true);
            userRecord.update();

            var userRecordSysID = userRecord.getUniqueValue();

            insertGroupResult = this.groupInsert(userRecordSysID, groups);

            return {
                insertUserResult: null,
                insertGroupResult: insertGroupResult,
                action: 'update', // Describes if user was added or updated
            };
        } else {
            throw new sn_ws_err.ServiceError()
                .setStatus(404)
                .setMessage(gs.getMessageLang("Requested user not found.", "en"))
                .setDetail(gs.getMessage("The user with the given user_name was not found."));
        }
    },

    /**
     * Adds user to list of groups
     * @param {string} userSysID
     * @param {Array} groups
     * @returns {string} sysId of the inserted record or null if the record is not inserted
     */
    groupInsert: function(userSysID, groups) {
        var insertResult = null;

        groups.forEach(function(group) {
            var sysUserGR = new GlideRecordSecure('sys_user_grmember');
            sysUserGR.addQuery('user', userSysID);
            sysUserGR.addQuery('group', group);
            sysUserGR.query();

            insertResult = null;

            if (!sysUserGR.next()) {
                sysUserGR.user = userSysID;
                sysUserGR.group = group;

                insertResult = sysUserGR.insert();

                if (!insertResult) {
                    throw new sn_ws_err.ServiceError()
                        .setStatus(500)
                        .setMessage(gs.getMessageLang("Error adding user to group", "en"))
                        .setDetail(gs.getMessage("Error adding user to group on developer instance: ", JSON.stringify(e)));
                }
            }
        });

        return insertResult;
    },

    /**
     * Checks if groups exist and returns the groups that do not in an array
     * @param {Array} groups 
     * @returns {Array} An empty array if all groups exist, otherwise, a list of group sysIds that do not exist 
     */
    getInvalidGroups: function(groups) {
        var groupsThatDoNotExist = [];

        groups.forEach(function(groupSysId) {
            var records = new GlideRecordSecure('sys_user_group');

            if (!records.get(groupSysId)) {
                groupsThatDoNotExist.push(groupSysId);
            }
        });
        return groupsThatDoNotExist;
    },

    getUser: function(userName) {
        var sysUserGR = new GlideRecordSecure('sys_user');

        sysUserGR.addQuery('user_name', userName);
        sysUserGR.query();
        sysUserGR.next();

        return sysUserGR.isValidRecord() ? sysUserGR : null;
    },

    type: 'AppIntakeUtils'
};
