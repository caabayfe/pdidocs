var RequestNotificationUpgradeUtilSNC = Class.create();
RequestNotificationUpgradeUtilSNC.prototype = {
    initialize: function() {
        this.notificationMappingSysIds = {
            'caaaab9dc0a80a6b0026b0746d5909cf': '3a92de88672630105f74e8a331b7300a',
            '2da1e256c6112284000b4c69dab7e993': 'a3360ac0672630105f74e8a331b73019',
            '2f2a8d62c0a8006401ee40a4185140b0': '0b4ae8c0b462b410f87755e926c386c2',
            '1e327c680a0a3c74004d7cf30e81f8a4': '78243e8877323010f088a0e89e5a9969',
            '2d9b4f23c6112284014937e2ad96b533': 'd0e27780b4b27050f87755e926c38683',
            'f1fae7b6c0a8011b004aad7f89c7d00f': 'bb32008477623010f088a0e89e5a9945'
        };
        this.gcd = GlideCollisionDetector.get();
    },
    updateRequestNotifications: function() {
        if (gs.nil(this.gcd)) {
            gs.info("Error in initiating GlideCollisionDetector.");
            return;
        }
        var newNotificationSysIds = [];
        var customerNotUpdatedNotificationSysIds = this.__getCustomerNotUpdatedNotifications();
        var notificationGr = new GlideRecord('sysevent_email_action');
        notificationGr.addEncodedQuery('active=true^sys_idIN' + Object.keys(this.notificationMappingSysIds));
        notificationGr.query();
        while (notificationGr.next()) {
            var notificationSysId = this.notificationMappingSysIds[notificationGr.sys_id];
            if (customerNotUpdatedNotificationSysIds.indexOf(notificationSysId) != -1)
                newNotificationSysIds.push(notificationSysId);
        }
        this.__inactivateNotifications(newNotificationSysIds);
    },

    __getRecord: function(sysId) {
        var gr = new GlideRecord("sysevent_email_action");
        if (gr.get(sysId)) {
            return gr;
        }
        gs.info("Record not found: " + sysId + '|' + tableName);
        return false;
    },

    __getCustomerNotUpdatedNotifications: function() {
        var notUpdatedNotifications = [];
        var self = this;
        Object.keys(this.notificationMappingSysIds).forEach(function(oldNotificationSysId) {
            var newNotificationSysId = self.notificationMappingSysIds[oldNotificationSysId];
            if (!(self.__isNotificationUpdated(newNotificationSysId)))
                notUpdatedNotifications.push(newNotificationSysId);
        });
        return notUpdatedNotifications;
    },

    //checks whether the notification is customized by customer or not
    __isNotificationUpdated: function(notificationSysId) {
        var notificationGr = this.__getRecord(notificationSysId);
        if (notificationGr) {
            var updateName = notificationGr.sys_update_name + "";
            if (this.gcd.containsKey(updateName)) {
                gs.info("!Detected customization in " + updateName);
                return true;
            }
            return false;
        }
    },

    __inactivateNotifications: function(notificationSysIds) {
        var gr = new GlideRecord('sysevent_email_action');
        gr.setWorkflow(false);
        gr.addEncodedQuery('active=true^sys_idIN' + notificationSysIds);
        gr.query();
        gr.setValue('active', false);
        gr.updateMultiple();
    },

    type: 'RequestNotificationUpgradeUtilSNC'
};
