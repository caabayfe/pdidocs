var NotifyQueueFlowAction = Class.create();
NotifyQueueFlowAction.prototype = Object.extendsObject(BaseNotifyFlowAction, {
    initialize: function() {
        BaseNotifyFlowAction.prototype.initialize.apply(this, arguments);
    },

    execute: function() {
        // generate a uuid to use as a random queue name
        var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0,
                v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
        this.queueAction = this.action.addQueue(uuid);

        // Save the action into a new notify_wf_activity
        var json = this.action.toJson();
        var notifyActivityGR = new GlideRecord(NotifyFlowConstants.TABLES.NOTIFY_WF_ACTIVITY);
        notifyActivityGR.initialize();
        notifyActivityGR.setValue(NotifyFlowConstants.COLUMNS.NOTIFY_CALL, this.notifyCallGR.getUniqueValue());
        notifyActivityGR.setValue(NotifyFlowConstants.COLUMNS.NOTIFY_ACTION, json);
        notifyActivityGR.insert();

        this._setNotifyActivityGR(notifyActivityGR);
    },

    type: 'NotifyQueueFlowAction'
});
