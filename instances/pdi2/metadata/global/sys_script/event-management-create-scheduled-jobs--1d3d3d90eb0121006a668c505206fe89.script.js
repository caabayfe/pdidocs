var PROPERTIES = {
    EVENT_JOB_COUNT: "evt_mgmt.event_processor_job_count",
    ENABLE_MULTI_NODE: "evt_mgmt.event_processor_enable_multi_node",
    EVENT_PROCESSING_DELAY: "evt_mgmt.events_processing_delay_sec",
};

// Use abort message as a flag to set abort action. Empty message means everything is OK.
var abortMessage = '';
var count;
var enableMultiNode;
var duration;

var currentPropertyName = current.getValue('name');
var currentPropertyValue = current.getValue('value');

switch (currentPropertyName) {
    case PROPERTIES.EVENT_JOB_COUNT:
        var MAX_NUMBER_OF_JOBS = 4;
        count = parseInt(Number(currentPropertyValue), 10) || 0;
        if (Number.isNaN(count) || (count <= 0) || (count > MAX_NUMBER_OF_JOBS)) {
            abortMessage = gs.getMessage("Number of defined jobs must be between 1 and {0}, inclusive. ", MAX_NUMBER_OF_JOBS);
        }
        break;
    case PROPERTIES.ENABLE_MULTI_NODE:
        enableMultiNode = String(currentPropertyValue === 'true');
        break;
    case PROPERTIES.EVENT_PROCESSING_DELAY:
    default:
        duration = parseInt(Number(currentPropertyValue, 10)) || duration;
        if (gs.nil(duration) || Number.isNaN(duration) || (duration <= 0) || (duration > (24 * 3600))) {
            abortMessage = gs.getMessage("Event processing delay duration must be greater than 1 second and smaller than 86400 seconds (1 day)");
        }
        break;
}

if (!gs.nil(abortMessage)) {
    gs.addErrorMessage(abortMessage);
    current.setAbortAction(true);
} else {
    var empc = new EvtMgmtProcessCoordinator();
    empc.createNewJobs(count, enableMultiNode, duration);
}
