process();

function process() {
    if (gs.getProperty('sn_vsc.security_task.automated_task.enabled') != 'true') {
        gs.debug("Skipped to create security task since automated tasking disabled");
        return;
    }

    var taskType = event.parm1;
    if (gs.nil(taskType)) {
        gs.warn("Skipped to create security task due to missing taskType in parm1");
        return;
    }

    try {
        var taskParams = {};
        if (event.parm2)
            taskParams = JSON.parse(event.parm2);

        gs.debug("Creating security task : type = {0}, sourceRecord = {1}, taskParams = {2}", taskType, event.instance, event.parm2);
        var taskNumber = new sn_vsc.SCTaskManagerOperations().createSecurityTask(taskType, event, taskParams);
        if (taskNumber)
            gs.debug("Created a new security task " + taskNumber);
    } catch (e) {
        gs.error("Error when creating security task: " + e);
    }
}
