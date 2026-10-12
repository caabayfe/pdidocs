
var SNCRestrictBasicAuthApplyFix = Class.create();
SNCRestrictBasicAuthApplyFix.prototype = {
   initialize: function() {},

   AUDIT_MARKER: 'system',
   SNC_EXTERNAL_ROLE_NAME: 'snc_external',

   _stamp: function(gr, isInsert) {
      gr.autoSysFields(false);
      var nowGdt = new GlideDateTime().getValue();
      if (isInsert) {
         gr.setValue('sys_created_by', this.AUDIT_MARKER);
         gr.setValue('sys_created_on', nowGdt);
         gr.setValue('sys_mod_count', 0);
      } else {
         var modCount = parseInt(gr.getValue('sys_mod_count') || '0', 10);
         gr.setValue('sys_mod_count', modCount + 1);
      }
      gr.setValue('sys_updated_by', this.AUDIT_MARKER);
      gr.setValue('sys_updated_on', nowGdt);
   },

   process: function() {

      if (!GlideProperties.getBoolean('glide.authenticate.basic_auth.restriction.active', false))
         return true;

      var ENFORCEMENT_DATE_PROP = 'glide.authenticate.basic_auth.restriction.enforcement_date';
      var TABLE_BASIC_AUTH_EXCEPTION = 'sys_user_basic_auth_exception';
      var nowValue = new GlideDateTime().getValue();

      if (!GlideTableDescriptor.isValid(TABLE_BASIC_AUTH_EXCEPTION)) {
         gs.warn('SNCRestrictBasicAuthApplyFix: ' + TABLE_BASIC_AUTH_EXCEPTION + ' not available — aborting.');
         return;
      }
      var exception = new GlideRecord(TABLE_BASIC_AUTH_EXCEPTION);
      exception.addQuery('decision', 'IN', 'grant,converted,global');
      exception.addQuery('action_taken', 'false');
      exception.query();
      while (exception.next()) {
         var uid = exception.getValue('user');
         if (!uid) continue;
         this.applyDecision(uid, exception.getValue('decision'));
         exception.setValue('action_taken', 'true');
         exception.update();
      }

      var enforcementDateProp = new GlideRecord('sys_properties');
      enforcementDateProp.addQuery('name', ENFORCEMENT_DATE_PROP);
      enforcementDateProp.query();
      if (enforcementDateProp.next()) {
         enforcementDateProp.setValue('value', nowValue);
         enforcementDateProp.setWorkflow(false);
         this._stamp(enforcementDateProp, false);
         enforcementDateProp.update();
      }
      var enforceProp = new GlideRecord('sys_properties');
      enforceProp.addQuery('name', 'glide.authenticate.basic_auth.restriction.enforce');
      enforceProp.query();
      if (enforceProp.next() && enforceProp.getValue('value') !== 'true') {
         enforceProp.setValue('value', 'true');
         enforceProp.setWorkflow(false);
         this._stamp(enforceProp, false);
         enforceProp.update();
      }
      GlidePropertiesDB.invalidate();

      // Disable both announcement records now that enforcement is active, by setting the end date to current time.
      var POLARIS_BANNER_SYS_ID = '1611c033ff74c31029a2ffffffffff4a';
      var SP_BANNER_SYS_ID      = '9a11c033ff74c31029a2ffffffffff48';
      this.disableRecord('sys_ux_banner_announcement', POLARIS_BANNER_SYS_ID, 'end');
      this.disableRecord('announcement', SP_BANNER_SYS_ID, 'to');

      gs.info('SNCRestrictBasicAuthApplyFix: process complete; enforcement date=' + nowValue + ' set.');
   },

   disableRecord: function(tableName, sysId, columnName) {
      if (!GlideTableDescriptor.isValid(tableName)) {
         gs.warn('SNCRestrictBasicAuthApplyFix: table ' + tableName + ' not available; skipping deactivation of ' + sysId + '.');
         return;
      }
      var nowGdt = new GlideDateTime().getValue();
      var gr = new GlideRecord(tableName);
      if (!gr.get(sysId)) {
         gs.warn('SNCRestrictBasicAuthApplyFix: record ' + sysId + ' not found in ' + tableName + '; skipping.');
         return;
      }
      gr.setValue(columnName, nowGdt);
      gr.setWorkflow(false);
      this._stamp(gr, false);
      gr.update();
      gs.info('SNCRestrictBasicAuthApplyFix: deactivated ' + tableName + ' record ' + sysId + '.');
   },

   hasExternalRole: function(userSysId) {
      return this.hasRoleName(userSysId, this.SNC_EXTERNAL_ROLE_NAME);
   },

   hasRoleName: function(userSysId, roleName) {
      var role = new GlideRecord('sys_user_role');
      role.addQuery('name', roleName);
      role.setLimit(1);
      role.query();
      if (!role.next()) return false;
      var gr = new GlideRecord('sys_user_has_role');
      gr.addQuery('user', userSysId);
      gr.addQuery('role', role.getUniqueValue());
      gr.setLimit(1);
      gr.query();
      return gr.next();
   },

   getDefaultDecision: function() {
      var raw = gs.getProperty('glide.authenticate.basic_auth.restriction.default_decision', '') || '';
      if (raw.indexOf('Revoke') !== -1)  return 'no_grant';
      if (raw.indexOf('Convert') !== -1) return 'converted';
      return 'grant';
   },

   applyDecision: function(userSysId, decision) {
      var userGr = new GlideRecord('sys_user');
      if (!userGr.get(userSysId)) {
         gs.error(this.type + ': applyDecision - user not found: ' + userSysId);
         return;
      }
      var userName = userGr.getValue('user_name');
      var resolvedDecision = (decision === 'global') ? this.getDefaultDecision() : decision;

      if (resolvedDecision === 'grant') {
         if (this.hasExternalRole(userSysId)) {
            gs.info(this.type + ': skipping grant for external user ' + userName);
            return;
         }
         var roleGr = new GlideRecord('sys_user_role');
         roleGr.addQuery('name', 'snc_basic_auth_api_access');
         roleGr.setLimit(1);
         roleGr.query();
         if (!roleGr.next()) {
            gs.error(this.type + ': applyDecision - role snc_basic_auth_api_access not found');
            return;
         }
         var existing = new GlideRecord('sys_user_has_role');
         existing.addQuery('user', userSysId);
         existing.addQuery('role', roleGr.getUniqueValue());
         existing.setLimit(1);
         existing.query();
         if (!existing.next()) {
            var uhr = new GlideRecord('sys_user_has_role');
            uhr.initialize();
            uhr.setValue('user', userSysId);
            uhr.setValue('role', roleGr.getUniqueValue());
            uhr.setValue('state', 'active');
            uhr.setWorkflow(false);
            this._stamp(uhr, true);
            uhr.insert();
         }
         gs.addInfoMessage(gs.getMessage('User {0} has been granted the basic auth access role', userName));

      } else if (resolvedDecision === 'converted') {
         userGr.setValue('web_service_access_only', true);
         if (userGr.isValidField('identity_type'))
            userGr.setValue('identity_type', 'machine');
         userGr.setWorkflow(false);
         userGr.update();
         gs.addInfoMessage(gs.getMessage('User {0} was converted to a web-service access only user', userName));

      } else if (resolvedDecision === 'no_grant') {
         gs.addInfoMessage(gs.getMessage('User {0} will be denied basic auth access when enforcement begins', userName));

      } else {
         gs.warn(this.type + ': applyDecision - unrecognized decision "' + resolvedDecision + '" for user ' + userName + '; skipping.');
      }
   },

   type: 'SNCRestrictBasicAuthApplyFix'
};
