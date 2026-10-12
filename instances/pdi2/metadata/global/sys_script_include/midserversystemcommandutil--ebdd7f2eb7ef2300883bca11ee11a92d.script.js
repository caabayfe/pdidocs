var MIDServerSystemCommandUtil = Class.create();

MIDServerSystemCommandUtil.prototype = {

    initialize: function() {},

    // See DEF0367917 for more details
    issueSystemCommandToSpecificMIDJS: function(system_command_name, mid_name) {

        if (JSUtil.nil(system_command_name)) {
            gs.warn('MIDServerSystemCommandUtil.issueSystemCommandToSpecificMIDJS() found nil system_command_name');
            return;
        }

        if (JSUtil.nil(mid_name)) {
            gs.warn('MIDServerSystemCommandUtil.issueSystemCommandToSpecificMIDJS() found nil mid_name');
            return;
        }

        var probeFields = {};
        probeFields.agent = 'mid.server.' + mid_name;
        probeFields.topic = "SystemCommand";
        probeFields.source = system_command_name;
        probeFields.priority = "0";
        probeFields.queue = "output";
        probeFields.state = "ready";

        if (!SNC.ECCQueueUtil.hasDuplicateOutputRecords(probeFields)) {
            var eccGr = new GlideRecord('ecc_queue');
            for (var name in probeFields)
                eccGr[name] = probeFields[name];
            eccGr.payload = '<?xml version="1.0" encoding="UTF-8"?><parameters><parameter name="skip_sensor" value="true"/></parameters>';
            eccGr.insert();
        }
    },

    issueSystemCommandToSpecificMID: function(system_command_name, mid_name, parameters) {

        if (JSUtil.nil(system_command_name)) {
            gs.warn('MIDServerSystemCommandUtil.issueSystemCommandToSpecificMID() found nil system_command_name');
            return;
        }

        if (JSUtil.nil(mid_name)) {
            gs.warn('MIDServerSystemCommandUtil.issueSystemCommandToSpecificMID() found nil mid_name');
            return;
        }
        var probeFields = {};
        probeFields.agent = mid_name;
        probeFields.topic = "SystemCommand";
        probeFields.source = system_command_name;
        probeFields.priority = "0";
        probeFields.queue = "output";
        probeFields.state = "ready";

        if (!SNC.ECCQueueUtil.hasDuplicateOutputRecords(probeFields)) {
            var probe = new SncProbe();
            probe.topic = "SystemCommand";
            probe.source = system_command_name;
            probe.setEccPriority("0");
            probe.addParameter("skip_sensor", "true");

            if (!JSUtil.nil(parameters)) {
                for (var i = 0; i < parameters.length; i++) {
                    var param = parameters[i];
                    if (param.encrypted)
                        probe.addEncryptedParameter(param.name, param.value);
                    else
                        probe.addParameter(param.name, param.value);
                }
            }

            probe.create("mid.server." + mid_name);
        }
    },

    issueSystemCommandToDeploymentMID: function(system_command_name, deployment_mid_name, target_data) {

        if (JSUtil.nil(system_command_name)) {
            gs.warn('MIDServerSystemCommandUtil.issueSystemCommandToDeploymentMID() found nil system_command_name');
            return;
        }

        if (JSUtil.nil(deployment_mid_name)) {
            gs.warn('MIDServerSystemCommandUtil.issueSystemCommandToDeploymentMID() found nil mid_name');
            return;
        }

        var probe = new SncProbe();
        probe.topic = "SystemCommand";
        probe.source = system_command_name;
        probe.setEccPriority("0");
        probe.addParameter("skip_sensor", "true");

        var jsonStr = JSON.stringify(target_data);
        gs.debug("reqPayload: " + jsonStr);

        probe.addEncryptedParameter("request", jsonStr);
        probe.create("mid.server." + deployment_mid_name);
    },

    issueSystemCommandToAllMIDs: function(system_command_name, filterOutInactiveMIDs, createECCRecordFromJS) {

        if (JSUtil.nil(system_command_name)) {
            gs.warn('MIDServerSystemCommandUtil.issueSystemCommandToAllMIDs() found nil system_command_name');
            return;
        }

        var gr = new GlideRecord("ecc_agent");
        if (filterOutInactiveMIDs)
            gr.addQuery('status', 'Up');

        gr.query();

        while (gr.next()) {
            if (createECCRecordFromJS)
                this.issueSystemCommandToSpecificMIDJS(system_command_name, gr.name);
            else
                this.issueSystemCommandToSpecificMID(system_command_name, gr.name);
        }
    },

    type: 'MIDServerSystemCommandUtil'
};
