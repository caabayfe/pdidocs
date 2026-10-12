var SCEventUtil = Class.create();
SCEventUtil.prototype = {
    constants: new sn_vsc.SecurityCenterConstants(),
    initialize: function() {},
    /**
     * This function will be called by script action Security center Event - Logins to handle
     * SC related login events.
     */
    loginEvent: function() {
        var that = this;
        var userGr = new GlideRecord(this.constants.SYS_USER);
        var userName = event.parm1;
        var currentIpAddress = event.parm2;
        var eventCreatedOn = event.sys_created_on;

        // Get current user
        userGr.addQuery('user_name', userName);
        userGr.query();

        // Check if user exists
        if (userGr.next()) {
            // Check if current user has roles we desire
            var query = 'role=' + this.constants.ADMIN_ROLE_SYS_ID + '^user=' + userGr.sys_id.toString();
            var sysUserRoleGr = new GlideRecord(this.constants.USER_HAS_ROLE);
            sysUserRoleGr.addEncodedQuery(query);
            sysUserRoleGr.query();
            if (sysUserRoleGr.hasNext()) {
                _checkAdminEvent(userGr, currentIpAddress);
            }
        } else {
            // No record, must be maint login
            // Check SNC Login Event
            _checkSncLoginEvent(currentIpAddress, userName);
        }

        /**
         * This function will log an admin login event to the sc events table
         * if the user logged in has the role admin.
         * @param {GlideRecord} gr - glide record of logged in user
         * @param {string} ipAddress - ip address of logged in user
         */
        function _checkAdminEvent(gr, ipAddress) {
            if (that._checkRole(gr, that.constants.ADMIN_ROLE_SYS_ID)) {
                // Grab event reference
                that._insertSecCenterEventRecord({
                    eventName: that.constants.scEvents.LOGIN_ADMIN,
                    ipAddress: ipAddress,
                    userGr: gr
                });
            }
        }

        /**
         * This function will log a snc login event to the sc events table
         * if the user logged in has snc prefixed to their name.
         * @param {string} name - username of logged in user
         * @param {string} ipAddress - ip address of logged in user
         */
        function _checkSncLoginEvent(ipAddress, userName) {
            if (userName.includes("@snc")) {
                // Grab event reference
                that._insertSecCenterEventRecord({
                    eventName: that.constants.scEvents.LOGIN_SNC,
                    ipAddress: ipAddress,
                    userName: userName
                });
            }
        }
    },

    /**
     * This function will be called by the script action Security center Event - Security Elevations
     * to handle SC related security elevation events
     */
    securityElevation: function() {
        var that = this;
        var elevatedUser = event.parm1;
        var elevatedTo = event.parm2;
        var eventCreatedOn = event.sys_created_on;

        // Grab user reference
        var userGr = this._userReference(elevatedUser);
        if (userGr) {
            // Log the security dashboard event and notify enabled users
            this._insertSecCenterEventRecord({
                eventName: this.constants.scEvents.SECURITY_ELEVATION,
                userGr: userGr
            });
        }
    },

    /**
     * This function will be called by the script action Security center Event - Impersonation Start
     * to handle SC related impersonation events
     */
    impersonation: function() {
        var that = this;
        var eventCreatedOn = event.sys_created_on;
        var userImpersonating = event.parm1;
        var userImpersonated = event.parm2;

        // Grab user reference
        var userGr = this._userReference(userImpersonating);
        if (userGr) {
            // Log the security dashboard event and notify impersonated user if HP
            this._insertSecCenterEventRecord({
                eventName: "impersonation",
                userGr: userGr,
                impersonated: userImpersonated
            });
        }
    },

    /**
     * This function will be called by the business rule SC - Store Export Data
     * to generate an export event.
     * @param {GlideRecord} current - The glide record of sys_user in it's current state
     */
    createExportEvent: function(current) {
        var jobGr = new GlideRecord(this.constants.SYS_POLL);
        jobGr.get(current.table_sys_id);
        if (jobGr.isValid()) {
            var exportedTableName = this._getTableNameFromFileName(current.file_name.toString());
            var exportByteSize = current.size_bytes.toString();
            var exportRecordCount = jobGr.max.toString();
            var exportData = {
                exportByteSize: exportByteSize,
                exportRecordCount: exportRecordCount
            };
            gs.eventQueue(this.constants.scEvents.EXPORT, jobGr, exportedTableName, JSON.stringify(exportData));
        }
    },

    /**
     * Given a file name such as 'sys_user_<id>.xml' or 'sys_user (<filters>).xml',
     * 		returns the name of the table, EX: 'sys_user'
     */
    _getTableNameFromFileName: function(input) {
        var id = input.match(/_[0-9a-f]{32}[.]/);
        var tableName = input;
        if (id) {
            tableName = tableName.split(id)[0];
        } else {
            tableName = tableName.split(/[ .]/)[0];
        }
        return tableName;
    },

    /**
     * This function will be called by Security center Event - Export to generate the dashboard event record
     * for export events.
     */
    createTableExportEvent: function() {
        var that = this;
        var exportedTableName = event.parm1;
        var exportData = JSON.parse(event.parm2);
        var userName = event.user_name;

        /// User ref
        var userGr = new GlideRecord(this.constants.SYS_USER);
        userGr.addQuery("user_name", userName);
        userGr.query();
        userGr.next();

        // Check for classifications
        var classification = this.checkClassification(exportedTableName);

        var grTable = new GlideRecord('sys_db_object');
        grTable.addQuery('name', exportedTableName);
        grTable.query();
        grTable.next();
        var tableId = grTable.sys_id;

        // Log the security dashboard event
        this._insertSecCenterEventRecord({
            eventName: this.constants.scEvents.EXPORT,
            userGr: userGr,
            size: exportData['exportByteSize'],
            records: exportData['exportRecordCount'],
            table: tableId,
            classification: classification
        });
    },

    createHpRoleAddedViaGroupEvent: function(userGroupMember) {
        var grGroupRole = new GlideRecord('sys_group_has_role');
        grGroupRole.addEncodedQuery('inherits=true^group=' + userGroupMember.group + '^role=2831a114c611228501d4ea6c309d626d^ORrole=b2d8f7130a0a0baa5bf52498ecaadeb4^ORrole=88a98433d7112100f20bc8170e61033e^ORrole=bca873d30a000704013944bd9a5e03a4');
        grGroupRole.query();
        while (grGroupRole.next()) {
            this._insertSecCenterEventRecord({
                eventName: this.constants.scEvents.HP_ROLE_GRANTED,
                userGr: this._userReference(userGroupMember.sys_updated_by),
                userGranted: userGroupMember.user,
                roleGranted: grGroupRole.role
            });
        }
    },

    createHpRoleAddedEvent: function(userHasRole) {
        this._insertSecCenterEventRecord({
            eventName: this.constants.scEvents.HP_ROLE_GRANTED,
            userGr: this._userReference(userHasRole.sys_updated_by),
            userGranted: userHasRole.user,
            roleGranted: userHasRole.role
        });
    },

    /**
     * This function will check if the current exported table contains classified columns.
     * It will return the classified columns on this table.
     * @param {string} tableName - The exported table name
     */
    checkClassification: function(tableName) {
        // Find all parent tables and possible classifications and build an encoded query
        var classifications = {};
        var extendedTables = this._getTables(tableName);
        for (var i = 0; i < extendedTables.length; i++) {
            extendedTables[i] = 'sys_dictionary.name=' + extendedTables[i];
        }

        // Find all classifications on columns from parent and child tables
        var dictClassGr = new GlideRecord(this.constants.DICT_CLASS);
        dictClassGr.addEncodedQuery(extendedTables.join('^OR'));
        dictClassGr.query();
        while (dictClassGr.next()) {
            classifications[dictClassGr.data_class.sys_id.toString()] = 1;
        }

        return Object.keys(classifications).toString();
    },

    /**
     * This function will insert a record to the sc events log.
     * @param {any} obj - This object will contain only the necessary parameters
     * for the type of security event being logged
     */
    _insertSecCenterEventRecord: function(obj) {
        // Insert into the mapped event table
        var eventTable = this.constants.scEventToTable[obj.eventName];
        var scEventGr = new GlideRecord(eventTable);
        scEventGr.initialize();
        scEventGr.user = obj.userGr ? obj.userGr.sys_id : null;
        scEventGr.user_name = obj.userGr ? obj.userGr.user_name : obj.userName;

        // Insert event specific data
        if (eventTable === "sn_vsc_login_event") {
            scEventGr.login_type = obj.eventName;
            scEventGr.ip_address = obj.ipAddress;
        } else if (eventTable === "sn_vsc_impersonation_event") {
            scEventGr.impersonated = obj.impersonated;
        } else if (eventTable === "sn_vsc_export_event") {
            scEventGr.size = obj.size;
            scEventGr.records = obj.records;
            scEventGr.classification = obj.classification;
            scEventGr.table = obj.table;
        } else if (eventTable === "sn_vsc_role_granted_event") {
            scEventGr.granted_to = obj.userGranted;
            scEventGr.role = obj.roleGranted;
        }

        // Insert
        scEventGr.insert();
    },

    /*
     * Return an array of table names in the table parent hierarchy
     * @return ArrayList
     */
    _getTables: function(tableName) {
        var table = new GlideTableHierarchy(tableName);
        return table.getTables();
    },

    /**
     * // Grab user reference
     * @param {string} userName
     */
    _userReference: function(userName) {
        var userGr = new GlideRecord(this.constants.SYS_USER);
        userGr.addQuery('user_name', userName);
        userGr.query();
        if (userGr.next()) {
            return userGr;
        }
    },

    /**
     * This function will check if the user has a role
     * @param {GlideRecord} userGr - The glide record for sys_user
     * @param {string} roleId - The sys_id of the role being checked
     */
    _checkRole: function(userGr, roleId) {
        var userRoleGr = new GlideRecord(this.constants.USER_HAS_ROLE);
        userRoleGr.addQuery('user', userGr.sys_id);
        userRoleGr.addQuery('role', roleId);
        userRoleGr.query();
        if (userRoleGr.next()) {
            return userRoleGr;
        }
    },

    type: 'SCEventUtil'
};
