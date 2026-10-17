var NotifyFlowUtil = Class.create();
NotifyFlowUtil.prototype = {
    ACTIVITY_WAIT_TIME: gs.getProperty("com.snc.notify.wf_activity_resp_wait_time", 1000),
    CALLBACK_WAIT_TIME: 172800,
    ZERO_EPOCH_TIME: "1970-01-01 00:00:00",

    initialize: function() {},

    getActionCallbackWaitTime: function() {
        var callbackWaitTime = gs.getProperty(
            "com.snc.notify.action_callback_wait_time",
            this.CALLBACK_WAIT_TIME
        );
        callbackWaitTime = Number(callbackWaitTime);
        if (Number.isNaN(callbackWaitTime) || callbackWaitTime <= 0)
            callbackWaitTime = this.CALLBACK_WAIT_TIME;
        callbackWaitTime *= 1000;

        var gdt = new GlideDateTime(this.ZERO_EPOCH_TIME);
        gdt.add(callbackWaitTime);
        return gdt.getValue();
    },

    processExecutingWorkflowActivities: function( /*GlideRecord*/ callOrMessageRecord) {
        var callSysID = callOrMessageRecord.getUniqueValue();
        var executingActivity = this.getExecutingActivity(callSysID);
        if (!executingActivity.hasNext())
            gs.info("No activities found to execute for call " + callSysID);

        var notifyAction = new SNC.NotifyAction();
        // find the executing activities
        while (executingActivity.next()) {
            var action = new SNC.NotifyAction();
            var json = executingActivity.getValue("notify_action");

            if (json) {
                action.fromJson(json, true);
                notifyAction.append(action);

                executingActivity.setValue("state", "processed");
                executingActivity.setValue("processed", new GlideDateTime());
                executingActivity.update();
            } else {
                // no NotifyActions found
                gs.info("No notify_action found for call " + callSysID + " and activity " + executingActivity.getValue("activity.name"));
            }
        }

        // set call record
        notifyAction.setCallRecord(callOrMessageRecord);

        return notifyAction;
    },

    getExecutingActivity: function(callSysID) {
        var gr = new GlideRecord("notify_wf_activity");
        gr.addQuery("notify_call", callSysID);
        gr.addQuery("state", "execute");
        gr.orderByDesc("sys_created_on");
        gr.query();
        return gr;
    },

    type: 'NotifyFlowUtil'
};
