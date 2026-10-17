var ac = new global.AvailabilitySummarizerV2();
var UTILS = new AvailabilityUtils();
if (current.getTableName() == 'service_commitment') {
    commitmentTimezoneChanged(current);
} else {
    recalculateAvailability();
}

function commitmentTimezoneChanged(current) {
    var deleteGr = new GlideRecord('service_availability');
    deleteGr.addQuery('service_commitment', current.sys_id);
    deleteGr.setWorkflow(false);
    deleteGr.query();
    while (deleteGr.next()) {
        var currentTz = deleteGr.time_zone;
        var commitmentTz = current.timezone;
        if (currentTz != commitmentTz) {
            deleteGr.deleteRecord();
        }
    }
    var gr = new GlideRecord('service_offering_commitment');
    gr.addQuery('service_commitment', current.sys_id);
    gr.query();
    while (gr.next()) {
        var offeringId = gr.service_offering;
        var commitmentId = current.sys_id;
        var date = UTILS.getStartAndEndDate(offeringId, commitmentId);
        var begin = new GlideDateTime(date.startDate);
        var end = new GlideDateTime(date.endDate);
        ac.setCi(offeringId);
        ac.setCommitments([commitmentId]);
        ac.summarize(begin, end);
    }
}

function recalculateAvailability() {
    var timeZone = UTILS.getTimezoneForCalculation();
    var existingTz = UTILS.getExistingTimeZone();
    //start calculating availability based on new time zone
    var date = UTILS.getStartAndEndDate(null, null);
    var begin = new GlideDateTime(date.startDate);
    var end = new GlideDateTime(date.endDate);
    ac.summarize(begin, end);
    //start deleting existing record with previous timezone
    removePreviousTimezoneAvailability(timeZone, existingTz);

    function removePreviousTimezoneAvailability(timeZone, existingTz) {
        var deleteGr = new GlideRecord('service_availability');
        deleteGr.setWorkflow(false);
        if (!timeZone) {
            deleteGr.query();
            while (deleteGr.next()) {
                var currentTz = deleteGr.getValue('time_zone');
                var commitmentTz = deleteGr.getElement('service_commitment.timezone');
                if (currentTz != commitmentTz) {
                    deleteGr.deleteRecord();
                }
            }
        } else {
            var timezoneIndex = existingTz.indexOf(timeZone);
            if (timezoneIndex > -1) {
                existingTz.splice(timezoneIndex, 1);
            }
            deleteGr.addQuery('time_zone', 'IN', existingTz);
            deleteGr.query();
            while (deleteGr.next())
                deleteGr.deleteRecord();
        }
    }
}
