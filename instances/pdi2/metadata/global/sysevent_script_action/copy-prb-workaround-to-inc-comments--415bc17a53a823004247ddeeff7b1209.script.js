var isMadridZboot = GlidePluginManager.isActive('com.snc.best_practice.problem.madrid');
var isSanDiegoZboot = GlidePluginManager.isActive('com.snc.best_practice.incident.sandiego');
var isWorknoteDefault = gs.getProperty("com.snc.incident.communicate_prb_workaround_to_inc_worknotes", false) === 'true';

var CLOSE_CODE_KNOWN_ERROR = "Known error";
var message = "[code]" + event.parm1 + "[/code]";
var incident = new GlideRecord('incident');
incident.addQuery('problem_id', current.getUniqueValue());

if (isMadridZboot && !isSanDiegoZboot) {
    incident.addQuery("incident_state", "<", IncidentState.RESOLVED);
    incident.query();
    while (incident.next()) {
        isWorknoteDefault ? incident.work_notes.setJournalEntry(current.number + ' ' + message) : incident.comments.setJournalEntry(current.number + ' ' + message);
        incident.update();
    }
} else if (isMadridZboot && isSanDiegoZboot) {
    incident.addQuery('state', IncidentState.RESOLVED);
    incident.addQuery('close_code', CLOSE_CODE_KNOWN_ERROR);
    incident.query();
    while (incident.next()) {
        isWorknoteDefault ? incident.work_notes.setJournalEntry(current.getDisplayValue() + ' ' + message) : incident.comments.setJournalEntry(current.getDisplayValue() + ' ' + message);
        incident.update();
    }
}
