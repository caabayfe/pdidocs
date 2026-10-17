var VAActionableNotificationHelper = Class.create();
VAActionableNotificationHelper.prototype = {
    initialize: function() {},

    type: 'VAActionableNotificationHelper'
};

VAActionableNotificationHelper.isActiveDeploymentExist = function() {
    var deployemntGA = new GlideAggregate("sys_now_assist_deployment");
    deployemntGA.addQuery('active', true);
    deployemntGA.addAggregate('COUNT');
    deployemntGA.query();
    if (deployemntGA.getRowCount() > 0)
        return true;

    return false;
};


VAActionableNotificationHelper.getActionIdsFromActionableContent = function(notificationId) {
    var actionableContentGr = new GlideRecord("sys_notification_actionable_content");
    actionableContentGr.addQuery("notification", notificationId);
    actionableContentGr.addActiveQuery();
    actionableContentGr.addQuery("content.sys_class_name", "sys_notification_va_content");
    actionableContentGr.query();
    if (actionableContentGr.next())
        return actionableContentGr.getValue("actions");

    return null;
};

VAActionableNotificationHelper.actionsPresentForALLModelTypes = function(notificationId, actionIds) {

    var actionsPresentByModelType = {
        "nlu_keyword": false,
        "llm": false
    };

    var actionGA = new GlideAggregate('sys_notification_va_action');
    actionGA.addQuery('notification', notificationId);
    actionGA.addQuery('active', true);
    actionGA.addQuery('sys_id', 'IN', actionIds);
    actionGA.addAggregate('COUNT', 'model_type');
    actionGA.query();

    while (actionGA.next() && actionGA.getAggregate('COUNT', 'model_type') > 0) {
		//Handle empty model scenario. 
        if (gs.nil(actionGA.getValue('model_type')))
            actionsPresentByModelType['nlu_keyword'] = true;
        else
            actionsPresentByModelType[actionGA.getValue('model_type')] = true;

    }

    if ((actionsPresentByModelType["nlu_keyword"] && !actionsPresentByModelType["llm"]) || (!actionsPresentByModelType["nlu_keyword"] && actionsPresentByModelType["llm"]))
        return false;

    return true;
};
