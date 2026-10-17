if (current.problem_state.changesTo(4)) {
   resolveRelatedIncidents(current);
   closeRelatedTasks(current);
}

// 
// Resolve any incidents that are related to the current problem
//
function resolveRelatedIncidents(me) {
  var incident = new GlideRecord("incident");
  incident.addQuery("problem_id", "=", me.sys_id);
  incident.query();
  while (incident.next()) {
    if ( incident.active == true ){
      var msg = gs.getMessage("Incident {0} resolved based on closure of problem {1}", [incident.number, me.number]);
      gs.print(msg);
      incident.incident_state.setValue(IncidentState.CLOSED);
      incident.comments = msg;
      incident.update(); 
    }
  }
}
