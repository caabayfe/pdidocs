var FoundationNotificationUtilSNC = Class.create();
        FoundationNotificationUtilSNC.prototype = {
            initialize: function() {},

            getPortalSuffix: function() {
                var portalSysId = this.getPortalSysIdFromSysProperties();
                var portalRecord = this.getPortalRecord(portalSysId);
                if (!portalRecord) {
                    var escPortalSysId = '70cd9f3b734b13001fdae9c54cf6a72f';
                    portalRecord = this.getPortalRecord(escPortalSysId);
                }
                return portalRecord.url_suffix;
            },

            getPortalRecord: function(portalSysId) {
                var spPortalGr = new GlideRecord('sp_portal');
                spPortalGr.addQuery('sys_id', portalSysId);
                spPortalGr.query();
                if (spPortalGr.next()) {
                    return spPortalGr;
                }
            },

            getPortalSysIdFromSysProperties: function() {
                var sysPropertiesGr = new GlideRecord('sys_properties');
                sysPropertiesGr.addQuery('name', 'sn_ex_emp_fd.ex.email.redirection.portal.sysId');
                sysPropertiesGr.addActiveQuery();
                sysPropertiesGr.query();
                if (sysPropertiesGr.next()) {
                    return sysPropertiesGr.value;
                }
            },

            type: 'FoundationNotificationUtilSNC'
        };
