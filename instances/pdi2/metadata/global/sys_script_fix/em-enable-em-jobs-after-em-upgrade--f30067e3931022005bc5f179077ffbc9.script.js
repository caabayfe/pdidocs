gs.log("Run 'EM - Enable EM jobs after EM upgrade' fix script after EM upgrade. Update EM jobs to be upgrade safe");

var EM_Connector_execution_job = "20b2d162eb1221006a668c505206fefb";
var EM_close_flapping = "3dde1e22eb211100c3346f5ca206fee2";
var EM_close_threshold = "0d6b1b70470121002853bc357c9a7189";
var EM_create_resolved_incidents = "fdab0713eb1211004d7763fba206fefc";
var EM_Maintenance_Calculator = "5fa0a9b2930312005bc5f179077ffb11";
var EM_Update_stuck_connectors = "8c86a0809352120056f8f179077ffb86";
var EM_Evaluate_Alert_Management_Rules = "2e58e739672203004cdb007d2685ef08";
var EM_Calculate_Alert_Priority1 = "1c7c55f7533332000238ddeeff7b1249";
var EM_Calculate_Alert_Priority2 = "d03ede30933332000238f179077ffb49";
var EM_process_events_PREFIX = "Event Management - process events";
var EM_Coordinator = "cd63bcf35b4263009a9f2a2c11f91aa2";
var EM_QueueConectorProcessor = '524b6f139300120056f8f179077ffb44';

//Limit on sys trigger table: name is up to 40 characters
var EM_Connector_execution_job_Trigger = "Connector execution";
var EM_Update_stuck_connectors_Trigger = "Update stuck connect";
var EM_close_flapping_Trigger = "Event Management - close flapping alerts";
var EM_close_threshold_Trigger = "Event Management - close threshold alert";
var EM_create_resolved_incidents_Trigger1 = "Event Management - resolved incidents cl";
var EM_create_resolved_incidents_Trigger2 = "Event Management - create/resolved incid";
var EM_Maintenance_Calculator_Trigger = "Event Management - Maintenance Calculato";
var EM_Evaluate_Alert_Management_Rules_Trigger = "Event Management - Evaluate Alert Manage";
var EM_Calculate_Alert_Priority_Trigger = "Event Management - Alert Priority Queue";
var EM_Coordinator_Trigger = "Event Management - Coordinator Job";
var EM_QueueConectorProcessor_Trigger = 'Event Management - Queue conector processor';

var EMjobs = [EM_Connector_execution_job, EM_close_flapping, EM_close_threshold,
    EM_create_resolved_incidents, EM_Maintenance_Calculator, EM_Update_stuck_connectors,
    EM_Calculate_Alert_Priority1, EM_Calculate_Alert_Priority2,
    EM_Evaluate_Alert_Management_Rules, EM_Coordinator, EM_QueueConectorProcessor];

var gr = new GlideRecord("sysauto");
gr.addQuery("sys_id", "IN", EMjobs);
gr.addQuery("upgrade_safe", false);
gr.query();
while (gr.next()) {
    gr.setValue("upgrade_safe", true);
    var isSysAutoUpdated = gr.update();
    if (!isSysAutoUpdated) {
        gs.warn("FAILED [sysauto] - Could not update upgrade_safe=true for: " + gr.getValue("name") + " | sys_id: " + gr.getUniqueValue());
    }
}

gr = new GlideRecord("sys_trigger");
var qc = gr.addQuery("name", "STARTSWITH", EM_process_events_PREFIX);
qc.addOrCondition("name", "CONTAINS", EM_Connector_execution_job_Trigger);
qc.addOrCondition("name", "CONTAINS", EM_Update_stuck_connectors_Trigger);
qc.addOrCondition("name", "CONTAINS", EM_close_flapping_Trigger);
qc.addOrCondition("name", "CONTAINS", EM_close_threshold_Trigger);
qc.addOrCondition("name", "CONTAINS", EM_create_resolved_incidents_Trigger1);
qc.addOrCondition("name", "CONTAINS", EM_create_resolved_incidents_Trigger2);
qc.addOrCondition("name", "CONTAINS", EM_Maintenance_Calculator_Trigger);
qc.addOrCondition("name", "CONTAINS", EM_Evaluate_Alert_Management_Rules_Trigger);
qc.addOrCondition("name", "CONTAINS", EM_Calculate_Alert_Priority_Trigger);
qc.addOrCondition("name", "CONTAINS", EM_Coordinator_Trigger);
qc.addOrCondition("name", "CONTAINS", EM_QueueConectorProcessor_Trigger);
gr.addQuery("upgrade_safe", false);
gr.query();
while (gr.next()) {
    gr.setValue("upgrade_safe", true);
    var isSysTriggerUpdated = gr.update();
    if (!isSysTriggerUpdated) {
        gs.warn("FAILED [sys_trigger] - Could not update upgrade_safe=true for: " + gr.getValue("name") + " | sys_id: " + gr.getUniqueValue());
    }
}

gs.log("Finish to run 'EM - Enable EM jobs after EM upgrade' fix script after EM upgrade. Enable EM jobs to be upgrade safe");
