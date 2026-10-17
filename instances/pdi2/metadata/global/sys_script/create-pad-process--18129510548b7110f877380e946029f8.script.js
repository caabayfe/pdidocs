(function executeRule(current, previous) {
    var pad_sys_id = gs.generateGUID().toString();

    // It is used to set the trigger type of process to `Record Create or Update`
    var TRIGGER_TYPE_RECORD_CREATED_OR_UPDATE = '789911170f1200108c87f4f0ff767e27';

    var currentGuidanceSysId = current.sys_id;
    var gsName = current.name;
    var gsDescription = current.description;

    var processTriggerGR = new GlideRecord('sys_pd_trigger_instance');
    processTriggerGR.initialize();
    processTriggerGR.setValue('process_definition', pad_sys_id);
    processTriggerGR.setValue('trigger_type', TRIGGER_TYPE_RECORD_CREATED_OR_UPDATE);
    processTriggerGR.setValue('label', 'Trigger for ' + gsName);

    var processTriggerID = processTriggerGR.insert();

    var process = {
        "sysId": pad_sys_id,
        "label": gsName,
        "description": gsDescription,
	"sysScope": current.sys_scope,
        "triggerRecordData": {
            "triggerType": {
                "value": TRIGGER_TYPE_RECORD_CREATED_OR_UPDATE
            },
            "triggerInstanceId": processTriggerID,
            "inputs": {
                "variables": [{
                        "variableName": "table",
                        "variableValue": "help_user_interaction",
                        "variableMapping": null
                    },
                    {
                        "variableName": "condition",
                        "variableValue": "guidance.process_definition=" + pad_sys_id,
                        "variableMapping": null
                    },
                    {
                        "variableName": "run_on_extended",
                        "variableValue": "false",
                        "variableMapping": null
                    }
                ]
            }
        }
    };

    var pdProcessService = new PDProcessService();
    pdProcessService.createProcess({
        process: process
    });

    current.process_definition = pad_sys_id;
    current.update();

})(current, previous);
