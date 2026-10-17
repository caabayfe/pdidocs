var FixDomainMissingScriptWriterRecords = Class.create();
FixDomainMissingScriptWriterRecords.prototype = {
    initialize: function() {
        this.USER_BATCH_LIMIT = 50000;
        this.ROLE_NAME = 'snc_required_script_writer_permission';
        this.GROUP_NAME = 'Conditional Script Writer';
        this.TABLE_USER_ROLE = 'sys_user_role';
        this.TABLE_USER_GROUP = 'sys_user_group';
        this.TABLE_USER_HAS_ROLE = 'sys_user_has_role';
        this.TABLE_USER_GRMEMBER = 'sys_user_grmember';
        this.TABLE_SYS_TRIGGER = 'sys_trigger';
        this.TRIGGER_SYS_ID = 'f8ecf339ff773210459effffffffffcb';
        this.FIELD_NAME = 'name';
        this.FIELD_ROLE = 'role';
        this.FIELD_USER = 'user';
        this.FIELD_GROUP = 'group';
        this.FIELD_INHERITED = 'inherited';
        this.FIELD_SYS_ID = 'sys_id';
        this.FIELD_SYS_DOMAIN = 'sys_domain';
        this.FIELD_SYS_DOMAIN_PATH = 'sys_domain_path';
        this.FIELD_SYS_CREATED_ON = 'sys_created_on';
        this.EMPTY_STRING = '';
        this.LOG_PREFIX = 'fixDomainMissingScriptWriterRecords: ';
        this.LOG_SOURCE = 'Scripting Governance';
    },

    processRecords: function() {
        if (GlidePluginManager.isZboot() || !GlidePluginManager.isActive("com.glide.domain")) {
            gs.log(this.LOG_PREFIX + 'Skipping - Zboot mode or domain plugin not active.', this.LOG_SOURCE);
            this._destroyJob();
            return;
        }

        var startTime = new GlideDateTime().getNumericValue();
        var roleSysId = this._getRoleSysId();
        if (!roleSysId) {
            gs.logError(this.LOG_PREFIX + 'Script writer role not found. Aborting.', this.LOG_SOURCE);
            return;
        }

        var groupSysId = this._getGroupSysId();
        if (!groupSysId) {
            gs.logError(this.LOG_PREFIX + 'Script writer group not found. Aborting.', this.LOG_SOURCE);
            return;
        }
        
        gs.log(this.LOG_PREFIX + 'Starting domain fix for Script Writer records.', this.LOG_SOURCE);

        var ga = this._getAffectedUsersAggregate(roleSysId);
        if (!ga.hasNext()) {
            gs.log(this.LOG_PREFIX + 'No records found to fix Script Writer records.', this.LOG_SOURCE);
            this._destroyJob();
            return {
                usersProcessed: 0,
                totalTime: new GlideDateTime().getNumericValue() - startTime
            };
        }

        var usersProcessed = 0;
        while (ga.next()) {
            var userSysId = ga.getValue(this.FIELD_USER);
            var roleGr = this._oldestUserRoleGR(roleSysId, userSysId);
            
            if (!roleGr.next()) {
                gs.warn(this.LOG_PREFIX + 'No role record found for user ' + userSysId);
                continue;
            }
            
            var oldestUserRoleSysId = roleGr.getUniqueValue();
            var domainId = roleGr.user.sys_domain;
            var domainPath = roleGr.user.sys_domain_path;
            var domain = {
                id: domainId,
                path: domainPath
            };
            
            this._updateUserRoleDomainFields(oldestUserRoleSysId, domain);
            this._updateGroupMemberDomainFields(groupSysId, userSysId, domain);
            this._deleteDuplicateUserRoleRecords(roleSysId, userSysId, oldestUserRoleSysId);
            usersProcessed++;
        }

        var totalTime = new GlideDateTime().getNumericValue() - startTime;
        gs.log(this.LOG_PREFIX + 'Processed ' + usersProcessed + ' users in ' + totalTime + ' ms.', this.LOG_SOURCE);

        return {
            usersProcessed: usersProcessed,
            totalTime: totalTime
        };
    },

    _destroyJob: function() {
        var gr = new GlideRecord(this.TABLE_SYS_TRIGGER);
        if (gr.get(this.TRIGGER_SYS_ID)) {
            gs.log(this.LOG_PREFIX + 'Deleting the job Fix missing domain fields for script writer records', this.LOG_SOURCE);
            gr.setWorkflow(false);
            gr.deleteRecord();
        } else {
            gs.log(this.LOG_PREFIX + 'Job Fix missing domain fields for script writer records not found', this.LOG_SOURCE);
        }
    },

    _getRoleSysId: function() {
        var gr = new GlideRecord(this.TABLE_USER_ROLE);
        gr.addQuery(this.FIELD_NAME, this.ROLE_NAME);
        gr.queryNoDomain();
        return gr.next() ? gr.getUniqueValue() : null;
    },

    _getGroupSysId: function() {
        var gr = new GlideRecord(this.TABLE_USER_GROUP);
        gr.addQuery(this.FIELD_NAME, this.GROUP_NAME);
        gr.queryNoDomain();
        return gr.next() ? gr.getUniqueValue() : null;
    },

    _getAffectedUsersAggregate: function(roleSysId) {
        var ga = new GlideAggregate(this.TABLE_USER_HAS_ROLE);
        ga.addQuery(this.FIELD_ROLE, roleSysId);
        ga.addQuery(this.FIELD_INHERITED, true);
        ga.addNullQuery(this.FIELD_SYS_DOMAIN_PATH)
            .addOrCondition(this.FIELD_SYS_DOMAIN_PATH, this.EMPTY_STRING)
            .addOrCondition(this.FIELD_SYS_DOMAIN, this.EMPTY_STRING);
        ga.groupBy(this.FIELD_USER);
        ga.setLimit(this.USER_BATCH_LIMIT);
        ga.queryNoDomain();
        return ga;
    },

    _oldestUserRoleGR: function(roleSysId, userSysId) {
        var roleGr = new GlideRecord(this.TABLE_USER_HAS_ROLE);
        roleGr.addQuery(this.FIELD_ROLE, roleSysId);
        roleGr.addQuery(this.FIELD_USER, userSysId);
        roleGr.addQuery(this.FIELD_INHERITED, true);
        roleGr.addNullQuery(this.FIELD_SYS_DOMAIN_PATH)
            .addOrCondition(this.FIELD_SYS_DOMAIN_PATH, this.EMPTY_STRING)
            .addOrCondition(this.FIELD_SYS_DOMAIN, this.EMPTY_STRING);
        roleGr.orderBy(this.FIELD_SYS_CREATED_ON);
        roleGr.setLimit(1);
        roleGr.queryNoDomain();
        return roleGr;
    },

    _updateUserRoleDomainFields: function(sysId, domain) {
        var dbq = new GlideDBQuery(this.TABLE_USER_HAS_ROLE);
        var dbu = new GlideDBUpdate(this.TABLE_USER_HAS_ROLE);
        dbq.addQuery(this.FIELD_SYS_ID, sysId);
        dbu.setQuery(dbq);
        dbu.setValue(this.FIELD_SYS_DOMAIN, domain.id);
        dbu.setValue(this.FIELD_SYS_DOMAIN_PATH, domain.path);
        dbu.execute();
        dbu.close();
        dbq.close();
    },

    _updateGroupMemberDomainFields: function(groupSysId, userSysId, domain) {
        var dbq = new GlideDBQuery(this.TABLE_USER_GRMEMBER);
        var dbu = new GlideDBUpdate(this.TABLE_USER_GRMEMBER);
        dbq.addQuery(this.FIELD_GROUP, groupSysId);
        dbq.addQuery(this.FIELD_USER, userSysId);
        dbq.addQuery(this.FIELD_SYS_DOMAIN_PATH, null)
            .addOrCondition(this.FIELD_SYS_DOMAIN_PATH, this.EMPTY_STRING)
            .addOrCondition(this.FIELD_SYS_DOMAIN, this.EMPTY_STRING);
        dbu.setQuery(dbq);
        dbu.setValue(this.FIELD_SYS_DOMAIN, domain.id);
        dbu.setValue(this.FIELD_SYS_DOMAIN_PATH, domain.path);
        dbu.execute();
        dbu.close();
        dbq.close();
    },

    _deleteDuplicateUserRoleRecords: function(roleSysId, userSysId, excludeSysId) {
        var dbq = new GlideDBQuery(this.TABLE_USER_HAS_ROLE);
        var dbd = new GlideDBDelete(this.TABLE_USER_HAS_ROLE);
        dbq.addQuery(this.FIELD_ROLE, roleSysId);
        dbq.addQuery(this.FIELD_USER, userSysId);
        dbq.addQuery(this.FIELD_INHERITED, true);
        dbq.addQuery(this.FIELD_SYS_ID, '!=', excludeSysId);
        dbq.addQuery(this.FIELD_SYS_DOMAIN_PATH, null)
            .addOrCondition(this.FIELD_SYS_DOMAIN_PATH, this.EMPTY_STRING)
            .addOrCondition(this.FIELD_SYS_DOMAIN, this.EMPTY_STRING);
        dbd.setQuery(dbq);
        dbd.execute();
        dbd.close();
        dbq.close();
    },

    type: 'FixDomainMissingScriptWriterRecords'
};
