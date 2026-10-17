var USER_TABLE = "sys_user";
var IAMSYNC_TYPE_TABLE = "iamsync_type";
var SYS_TRIGGER_TABLE = "sys_trigger";
var IAMSYNC_TYPE_NAME = "User";
var IAMSYNC_STATUS_COMPLETED = "Completed";
var IAMSYNC_STATUS_ERROR = "Error";
var TRIGGER_NAME = "IAM Generate Federated ID for Table-sys_user";
var TRIGGER_TYPE_IN_REPEAT = "1";
var TRIGGER_TYPE_IN_DISABLED = "2";

generateUserFedIdInMonthlyJob();

function generateUserFedIdInMonthlyJob() {
    if (!isFedIDGenerationJobCompleted()) {
        var triggerType = getFedIDJobTriggerType();
        if (triggerType == TRIGGER_TYPE_IN_REPEAT) {
            gs.warn("Federated ID Generation: Skipping regenerate federated ID for users monthly job as another regeneration job is already in progress.");
            return;
        }
        if (triggerType == TRIGGER_TYPE_IN_DISABLED) {
            gs.info("Federated ID Generation: Marking federated ID job into error state");
            setFedIDGenerationJobToError();
        }
    }
    gs.info("Federated ID Generation: Starting federated ID regeneration for " + USER_TABLE + " table.");
    try {
        var helper = new sn_identity.FederatedIDGenerationHelper();
        helper.regenerateIdForAllRecords(USER_TABLE);
    } catch (err) {
        gs.error("Federated ID generation failed for " + USER_TABLE + " table: " + err);
    }
}

function isFedIDGenerationJobCompleted() {
    var gr = new GlideRecord(IAMSYNC_TYPE_TABLE);
    gr.addQuery("type_name", IAMSYNC_TYPE_NAME);
    gr.query();
    var status = "";
    if (gr.next()) {
        status = gr.getValue("status");
    }
    return ([IAMSYNC_STATUS_COMPLETED, IAMSYNC_STATUS_ERROR].includes(status));
}

function setFedIDGenerationJobToError() {
    var gr = new GlideRecord(IAMSYNC_TYPE_TABLE);
    gr.addQuery("type_name", IAMSYNC_TYPE_NAME);
    gr.query();
    if (gr.next()) {
        gr.setValue("status", IAMSYNC_STATUS_ERROR);
        gr.update();
    }
}

function getFedIDJobTriggerType() {
    var gr = new GlideRecord(SYS_TRIGGER_TABLE);
    gr.addQuery("name", TRIGGER_NAME);
    gr.query();
    var trigger_type = 0;
    if (gr.next()) {
        trigger_type = gr.getValue("trigger_type");
    }
    return trigger_type;
}
