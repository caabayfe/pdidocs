var CMDBAffectedCINotificationsUtils = Class.create();
CMDBAffectedCINotificationsUtils.prototype = {
    initialize: function() {},

    hasAffected: function(taskGR, table, field) {
        var affectedGR = new GlideRecord(table);
        affectedGR.setLimit(1);
        affectedGR.addQuery(field, taskGR.sys_id);
        affectedGR.query();
        if (affectedGR.getRowCount() > 0)
            return true;

        return false;
    },

    handleTaskAffectedCIs: function(task_sys_id) {
        var affectedItem = new GlideRecord('task_ci');
        affectedItem.addQuery('task', task_sys_id);
        affectedItem.setLimit(parseInt(gs.getProperty('NotifyAffectedCI.max_cis', '100000')));
        affectedItem.query();
        var affectedCIs = [];
        while (affectedItem.next()) {
            affectedCIs.push(affectedItem.getValue('ci_item'));
        }
        if (affectedCIs.length > 0) {
            this._notifySubscribers(affectedCIs);
        }
    },

    _notifySubscribers: function(ciSysIds) {
        if (ciSysIds.length == 0) return;
        var ciList = [];
        var ciAffectedNotificationTypes = this._getCIAffectedNotificationTypes();
        var legacySubscriptionModel = gs.getProperty('glide.notification.use_legacy_subscription_model');
        var ciBatchSize = 100;
        var eventProperties = {};
        eventProperties['maxEvents'] = parseInt(gs.getProperty('NotifyAffectedCI.max_events', '50000'));
        eventProperties['eventCount'] = 0;

        for (var index = 0; index < ciSysIds.length; index += ciBatchSize) {
            var batch = ciSysIds.slice(index, index + ciBatchSize);
            ciList = [];
            if (legacySubscriptionModel == 'true') {
                var mGr = new GlideAggregate('cmn_notif_message');
                mGr.addQuery('configuration_item', 'IN', batch);
                mGr.addQuery('notification', 'IN', ciAffectedNotificationTypes);
                mGr.groupBy('configuration_item');
                mGr.query();
                while (mGr.next()) {
                    var ci = mGr.configuration_item + '';
                    ciList.push(ci);
                }
            } else {
                var nGr = new GlideAggregate('sys_notif_subscription');
                nGr.addActiveQuery();
                nGr.addQuery('affected_record', 'IN', batch);
                nGr.addQuery('notification', 'IN', ciAffectedNotificationTypes);
                nGr.groupBy('affected_record');
                nGr.query();
                while (nGr.next()) {
                    var ar = nGr.affected_record + '';
                    ciList.push(ar);
                }
            }
            if (ciList.length > 0) this._queueCis(ciList, eventProperties);
        }
    },

    _queueCis: function(ciList, eventProperties) {
        var ciDisplayName = '',
            ciSysId = '';
        var ciGr = new GlideRecord('cmdb_ci');
        ciGr.addQuery('sys_id', 'IN', ciList);
        ciGr.query();
        while (ciGr.next()) {
            ciSysId = ciGr.sys_id;
            ciDisplayName = ciGr.getDisplayValue();
            gs.eventQueue('ci.affected', current, ciSysId, ciDisplayName, 'cmdb_ci_affected');
            eventProperties.eventCount++;
            if (eventProperties.eventCount >= eventProperties.maxEvents) return;
        }
    },

    _getCIAffectedNotificationTypes: function() {
        var gr = new GlideRecord('sysevent_email_action');
        gr.addQuery('event_name', 'ci.affected');
        gr.addActiveQuery();
        gr.query();
        var ids = '';
        while (gr.next()) {
            ids += gr.getValue('sys_id');
            if (gr.hasNext()) ids += ',';
        }
        return ids;
    },
    type: 'CMDBAffectedCINotificationsUtils'
};
