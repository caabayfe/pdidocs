
var SNCRestrictBasicAuthUserAuthenticationGate = Class.create();

SNCRestrictBasicAuthUserAuthenticationGate.prototype = {
   initialize: function(user, roles, user_type) {
      this.user = '' + user;
      this.roles = '' + roles;
      this.user_type = '' + user_type;
   },

   isAllowed: function() {
      var i, v;
      try {

         if (!GlideProperties.getBoolean('glide.authenticate.basic_auth.restriction.active', false))
            return true;

         this.ensureEnforcementDateAndActivateTrigger();

         if (this.user_type && this.user_type != 'Normal' && this.user_type != 'LDAP')
            return true;

         if (GlideProperties.getBoolean('glide.authenticate.basic_auth.allow_wsao', true) && GlideUser.isWebSvcAccessOnly(this.user))
            return true;

         var txn = GlideTransaction.get();
         if (!txn || ('' + txn.getPageName()) === 'oauth_token')
            return true;

         var req = txn.getRequest();
         if (!req) return true;

         // Run gate only for basic-auth requests.
         // When Authorization is visible, the scheme must be "Basic".
         // When it is null, LoginRequestFiltered may have masked a Basic auth header.
         var __auth = req.getHeader('Authorization');
         if (__auth != null && !('' + __auth).toLowerCase().startsWith('basic')) return true;
         var __basicAuthFiltered = false;
         var __names = req.getHeaderNames();
         if (__names) {
            while (__names.hasMoreElements()) {
               if (('' + __names.nextElement()).toLowerCase() === 'authorization') {
                  __basicAuthFiltered = true;
                  break;
               }
            }
         }
         if (!__basicAuthFiltered) return true;

         var u = GlideUser.getUser(this.user);
         if (!u || !u.exists()) {
            gs.warn('SNCRestrictBasicAuthUserAuthenticationGate: could not resolve authenticated user [' + this.user + ']');
            return false;
         }
         var sysId = u.getID() || '';
         if (!sysId)
            return false;

         // TOTP validated once in this HttpSession is sufficient.
         var httpSession = req.getSession();
         if( (httpSession && httpSession.getAttribute('is_totp_provided_in_basic_auth_flow_session_attr') == 'true')               || (this.isMFAForIntegrationsEnabled() && this.hasUserMFASetup(sysId)) )            return true;

         var rawAllowedUsers = (gs.getProperty('glide.authenticate.basic_auth.allowed_users', '') || '').trim();
         if (rawAllowedUsers) {
            var allowedUsers = rawAllowedUsers.split(",");
            for (var j = 0; j < allowedUsers.length; j++) {
               var allowedSysId = (allowedUsers[j] || '').trim();
               if (allowedSysId && allowedSysId == sysId)
                  return true;
            }
         }

         var userRoles = u.getRoles();
         if (this.hasExternalRole(userRoles))
            return GlideProperties.getBoolean('glide.authenticate.basic_auth.allow_snc_external', true);

         var rawRoles = (gs.getProperty('glide.authenticate.basic_auth.allowed_roles', '') || '').trim();
         if (rawRoles) {
            var roleParts = rawRoles.split(/,+/);
            for (i = 0; i < roleParts.length; i++) {
               v = (roleParts[i] || '').trim();
               if (v && userRoles.contains(v))
                  return true;
            }
         }

         var isEnforceEnabled = GlideProperties.getBoolean('glide.authenticate.basic_auth.restriction.enforce', false);
         var enforcementDateRaw = gs.getProperty('glide.authenticate.basic_auth.restriction.enforcement_date', '');
         if (enforcementDateRaw) {
            var enforcementDate = new GlideDateTime(enforcementDateRaw);
            if (!isEnforceEnabled && (new GlideDateTime()).getNumericValue() < enforcementDate.getNumericValue()) {
               this.upsertBasicAuthException(sysId);
               return true;
            }
         }

         var eventLogParm1 = "user_name=" + u.getName();
         var eventLogParm2 = "User must provide MFA OTP or have snc_basic_auth_api_access role or is WSAO User to continue login";
         SNC.SecurityEventSender.sendLoginGCFEvent("DB", "failure", eventLogParm1, eventLogParm2);
         gs.warn('SNCRestrictBasicAuthUserAuthenticationGate: denied basic-auth API call for interactive-login user [' + this.user + '] under enforce=true');
         return false;
      } catch (e) {
         gs.error('SNCRestrictBasicAuthUserAuthenticationGate: isAllowed error: ' + e);
         return false;
      }
   },

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

   hasExternalRole: function(userRoles) {
      return userRoles && userRoles.contains(this.SNC_EXTERNAL_ROLE_NAME);
   },

   upsertBasicAuthException: function(userSysId) {
      if (!GlideTableDescriptor.isValid('sys_user_basic_auth_exception'))
         return;
      var exception = new GlideRecord('sys_user_basic_auth_exception');
      exception.addQuery('user', userSysId);
      exception.setLimit(1);
      exception.query();
      var isInsert = !exception.next();
      if (isInsert) {
         exception.initialize();
         exception.setValue('user', userSysId);
         exception.setValue('decision', this.getDefaultDecision());
         exception.setValue('usage_count', 1);
         if (exception.isValidField('source')) exception.setValue('source', 'Detected during tracking');
      } else {
         exception.setValue('usage_count', (parseInt(exception.getValue('usage_count') || '0', 10) || 0) + 1);
      }
      exception.setValue('last_seen', new GlideDateTime().getValue());
      exception.setWorkflow(false);
      this._stamp(exception, isInsert);
      if (isInsert) {
         exception.insert();
         gs.warn('SNCRestrictBasicAuthUserAuthenticationGate: recorded basic-auth exception candidate for user ' + userSysId);
      } else {
         exception.update();
      }
   },

   getDefaultDecision: function() {
      var raw = gs.getProperty('glide.authenticate.basic_auth.restriction.default_decision', '') || '';
      if (raw.indexOf('Revoke') !== -1)  return 'no_grant';
      if (raw.indexOf('Convert') !== -1) return 'converted';
      return 'grant';
   },

   hasUserMFASetup: function(userId) {
      if (!GlideTableDescriptor.isValid('sys_user_multi_factor_setup')) {
         gs.error('SNCRestrictBasicAuthUserAuthenticationGate: table sys_user_multi_factor_setup is not available.');
         return false;
      }
      var ga = new GlideAggregate('sys_user_multi_factor_setup');
      ga.addQuery('user', userId);
      ga.addAggregate('COUNT');
      ga.query();
      return ga.next() && parseInt(ga.getAggregate('COUNT'), 10) > 0;
   },

   isMFAForIntegrationsEnabled: function() {
      return gs.getProperty('glide.authenticate.multifactor.for_integrations', 'false') === 'true';
   },

   ensureEnforcementDateAndActivateTrigger: function() {
      var enforcementDateRaw = gs.getProperty('glide.authenticate.basic_auth.restriction.enforcement_date');
      if (enforcementDateRaw == '') {
         this.activateEnforcementTrigger();
      }
   },

   activateEnforcementTrigger: function() {
      try {
         var nextActionValue = new GlideDateTime();
         nextActionValue.addDaysUTC(1);
         var nextActionStr = nextActionValue.getValue();
         this.setEnforcementDateProperty(nextActionStr);
         this.setEnforcementTriggerActive(nextActionStr);
      } catch (e) {
         gs.error('SNCRestrictBasicAuthUserAuthenticationGate.activateEnforcementTrigger: ' + e);
      }
   },

   setEnforcementTriggerActive: function(nextActionStr) {
      if (!GlideTableDescriptor.isValid('sys_trigger'))
         return;
      var gr = new GlideRecord('sys_trigger');
      gr.addQuery('name', 'SNCRestrictBasicAuth scheduled enforcement');
      gr.setLimit(1);
      gr.query();
      if (!gr.next()) {
         gs.warn('SNCRestrictBasicAuthUserAuthenticationGate.setEnforcementTriggerActive: trigger not found');
         return;
      }
      gr.setValue('trigger_type', 0);
      gr.setValue('next_action', nextActionStr);
      gr.setWorkflow(false);
      this._stamp(gr, false);
      gr.update();
   },

   setEnforcementDateProperty: function(value) {
      var gr = new GlideRecord('sys_properties');
      gr.addQuery('name', 'glide.authenticate.basic_auth.restriction.enforcement_date');
      gr.setLimit(1);
      gr.query();
      if (!gr.next()) {
         gs.warn('SNCRestrictBasicAuthUserAuthenticationGate.setEnforcementDateProperty: property not found');
         return;
      }
      gr.setValue('value', value);
      gr.setWorkflow(false);
      this._stamp(gr, false);
      if (gr.update()) {
         // Refresh in-memory cache for this property
         GlideProperties.set('glide.authenticate.basic_auth.restriction.enforcement_date', value);
      }
   },

   type: 'SNCRestrictBasicAuthUserAuthenticationGate'
};
