var IncidentNotificationUtilSNC = Class.create();
IncidentNotificationUtilSNC.prototype = {
    initialize: function() {
        this.notificationMappingSysIds = {
            '498162a20a0a0b4b00725fb9e5b6aeb3': '4d505448e5aeb410f8777565f90b2f13',
            '8f9389b5c0a8016401715c208ff9bf48': '58e3c1d45322301001b2ddeeff7b1266',
            '8f9cea1dc0a801640185982cb7b19252': 'fc78e05653a6301001b2ddeeff7b128d',
            '24e34b54c61122aa0108c1b7a33697cf': '5b82abc767a630105f74e8a331b73092',
            'be1a8cb6c0a8016600d5d5f018487cd4': 'b2b3e70b67a630105f74e8a331b73044'
        };
        this.gcd = null;
    },

    updateIncidentNotifications: function() {
	this.gcd = GlideCollisionDetector.get();
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

    getLatestCommentOrWorkNotes: function(table, sysId, element) {
        var comment = {};
        var journalRec = new GlideRecord('sys_journal_field');
        journalRec.addQuery('name', table);
        journalRec.addQuery('element_id', sysId);
        journalRec.addQuery('element', element);
        journalRec.orderByDesc('sys_created_on');
        journalRec.setLimit(1);
        journalRec.query();
        if (journalRec.next()) {
            var notes = journalRec.value.trim();
            notes = notes.replace(/\n/g, '<br/>');
            notes = notes.replaceAll("[code]","");
            notes = notes.replaceAll("[/code]","");
            if (notes.length > 0) {
                comment.val = notes;
            }
            if (journalRec.sys_created_by == "system")
                comment.user = "System";
            else {
                var userRec = new GlideRecord('sys_user');
                userRec.addQuery('user_name', journalRec.sys_created_by);
                userRec.setLimit(1);
                userRec.query();

                if (userRec.next())
                    comment.user = (userRec.getValue('name'));
            }
        }
        return comment;
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
    type: 'IncidentNotificationUtilSNC'
};
