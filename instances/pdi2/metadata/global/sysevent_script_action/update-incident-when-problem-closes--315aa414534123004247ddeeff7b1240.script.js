var ON_HOLD_REASON_AWAITING_PROBLEM = '3';
var CLOSE_CODE_SOLVED_PERMANENTLY = "Solved (Permanently)";

if (GlidePluginManager.isActive('com.snc.best_practice.incident.sandiego')) {
    CLOSE_CODE_SOLVED_PERMANENTLY = "Resolved by problem";
}
var incident = new GlideRecord('incident');
incident.addQuery('problem_id', current.getUniqueValue());
incident.addQuery('state', '=', IncidentState.AWAITING_PROBLEM);
incident.addQuery('hold_reason', '=', ON_HOLD_REASON_AWAITING_PROBLEM);
incident.query();

if (current.resolution_code == 'fix_applied') {
    var fixNotes = "[code]" + current.fix_notes + "[/code]";
    var resolutionNotes = gs.getMessage("Related problem {0} closed.", [current.number]);
    while (incident.next()) {
        incident.work_notes = fixNotes;
        incident.close_code = CLOSE_CODE_SOLVED_PERMANENTLY;
        incident.close_notes = resolutionNotes;
        incident.state = IncidentState.RESOLVED;
        incident.resolved_by = current.resolved_by;
        incident.update();
        gs.eventQueue('incident.resolved_by_problem', incident, current.number);
    }
} else if (current.resolution_code == 'risk_accepted') {
    var workNotes = gs.getMessage("Problem team has accepted the risk of not fixing this problem {0} \n \n {1}", [current.number, current.close_notes]);
    while (incident.next()) {
        incident.work_notes = workNotes;
        incident.update();
        gs.eventQueue('incident.updated_by_problem', incident, current.number);
    }
}
