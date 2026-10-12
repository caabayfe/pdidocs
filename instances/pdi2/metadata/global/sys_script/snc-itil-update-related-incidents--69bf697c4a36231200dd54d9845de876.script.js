updateRelatedIncidents();

function updateRelatedIncidents() {
  var inc = new GlideRecord("incident");
  inc.addActiveQuery();
  inc.addQuery("problem_id", current.sys_id);
  inc.query();
  while (inc.next()) {
    if (inc.incident_state == 3)
       inc.incident_state = 2;
    if (!current.close_notes.nil())
       inc.work_notes = "Related problem " + current.number + " closed with the following Close Notes:\n\n" + current.close_notes;
    inc.update(); 
  }
}
