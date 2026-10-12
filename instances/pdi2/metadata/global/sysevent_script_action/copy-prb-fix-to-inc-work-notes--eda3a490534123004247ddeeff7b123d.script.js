var problemNumber = current.number;
var problemSysId = current.sys_id;
var problemUrl = '<a href="' + gs.getProperty('glide.servlet.uri') + 'problem.do?sys_id=' + problemSysId + '">' + problemNumber + '</a>';
var fixNotes = "[code]" + "Proposed/Planned fix shared from " + problemUrl + ": " + event.parm1.replace('<p>', '') + "[/code]";
var incident = new GlideRecord('incident');
incident.addQuery('problem_id', current.getUniqueValue());
incident.addQuery('state', '<=', IncidentState.RESOLVED);
incident.query();
while (incident.next()) {
    incident.work_notes.setJournalEntry(fixNotes);
    incident.update();
}
