var ScriptingGovernanceRoleUtil = Class.create();
var USER_ROLE_TABLE_NAME = 'sys_user_has_role';
var USER_GROUP_TABLE_NAME = 'sys_user_group';
var ROLE_TABLE_NAME = 'sys_user_role';
var GRANTED_BY_COL_NAME = 'granted_by';
var INHERITED_COL_NAME = 'inherited';
var INCLUDED_IN_ROLE_COL_NAME = 'included_in_role';
var INCLUDED_IN_ROLE_INSTANCE_COL_NAME = 'included_in_role_instance';
var INH_COUNT_COL_NAME = 'inh_count';
var ROLE_COL_NAME = 'role';
var NAME_COL_NAME = 'name';
var SYS_ID_COL_NAME = 'sys_id';
ScriptingGovernanceRoleUtil.prototype = {
    initialize: function() {},

    fixUserHasRoleRecords: function() {
        var scriptWriterRoleSysID = this._getScriptWriterRoleSysID();
        var conditionalScriptWriterGroupSysID = this._getConditionalScriptWriterGroupSysID();
        if (!scriptWriterRoleSysID || !conditionalScriptWriterGroupSysID) {
            return;
        }
        if (this._isRoleManagementV1()) {
            gs.info("Scripting Governance: Adding granted by for existing script writer user role records");
            this._updateGrantedByForScriptWriterUserRoleRecords(scriptWriterRoleSysID, conditionalScriptWriterGroupSysID);
        } else {
            gs.info("Scripting Governance: Adding inh_count for existing script writer user role records");
            this._updateInhCountForScriptWriterUserRoleRecords(scriptWriterRoleSysID);
        }
    },

    _updateGrantedByForScriptWriterUserRoleRecords: function(scriptWriterRoleSysID, conditionalScriptWriterGroupSysID) {
        try {
            var dbq = new GlideDBQuery(USER_ROLE_TABLE_NAME);
            var dbu = new GlideDBUpdate(USER_ROLE_TABLE_NAME);
            dbq.addQuery(GRANTED_BY_COL_NAME, '');
            dbq.addQuery(INHERITED_COL_NAME, true);
            dbq.addQuery(INCLUDED_IN_ROLE_COL_NAME, '');
            dbq.addQuery(INCLUDED_IN_ROLE_INSTANCE_COL_NAME, '');
            dbq.addQuery(ROLE_COL_NAME, scriptWriterRoleSysID);
            dbu.setQuery(dbq);
            dbu.setMultiple(true);
            dbu.setValue(GRANTED_BY_COL_NAME, conditionalScriptWriterGroupSysID);
            dbu.execute();
        } catch (e) {
            gs.error('Scripting Governance::fixExistingScriptWriterUserRoleRecords Error: ', e);
        } finally {
            dbu.close();
            dbq.close();
        }
    },

    _updateInhCountForScriptWriterUserRoleRecords: function(scriptWriterRoleSysID) {
        try {
            var dbq = new GlideDBQuery(USER_ROLE_TABLE_NAME);
            var dbu = new GlideDBUpdate(USER_ROLE_TABLE_NAME);
            dbq.addQuery(INH_COUNT_COL_NAME, '');
            dbq.addQuery(INHERITED_COL_NAME, true);
            dbq.addQuery(ROLE_COL_NAME, scriptWriterRoleSysID);
            dbu.setQuery(dbq);
            dbu.setMultiple(true);
            dbu.setValue(INH_COUNT_COL_NAME, '1');
            dbu.setValue(GRANTED_BY_COL_NAME, 'not-applicable');
            dbu.execute();
        } catch (e) {
            gs.error('Scripting Governance::fixExistingScriptWriterUserRoleRecords Error: ', e);
        } finally {
            dbu.close();
            dbq.close();
        }
    },

    _getScriptWriterRoleSysID: function() {
        var gr = new GlideRecord(ROLE_TABLE_NAME);
        gr.addQuery(NAME_COL_NAME, 'snc_required_script_writer_permission');
        gr.query();
        if (gr.next()) {
            return gr.getValue(SYS_ID_COL_NAME);
        }
        gs.info("Scripting Governance: script writer role sys id is not found");
        return null;
    },

    _getConditionalScriptWriterGroupSysID: function() {
        var gr = new GlideRecord(USER_GROUP_TABLE_NAME);
        gr.addQuery(NAME_COL_NAME, 'Conditional Script Writer');
        gr.query();
        if (gr.next()) {
            return gr.getValue(SYS_ID_COL_NAME);
        }
        gs.info("Scripting Governance: Conditional script writer group sys id is not found");
        return null;
    },

    _isRoleManagementV1: function() {
        return !GlideProperties.getBoolean('glide.role_management.use.inh_count', false) ||
            !pm.isActive('com.glide.role_management.inh_count');
    },
    type: 'ScriptingGovernanceRoleUtil'
};
