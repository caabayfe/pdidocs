gs.log("Release Insert Phases starting");
insertPhases(current);
gs.log("Release Insert Phases ending");


function insertPhases(current) {
  var phases = current.phases.getChoices(current.type);
  var order = 100;
  var active = true;
  for (var i = 0; i < phases.size(); i++) {
    var phase = phases.get(i);   
    var grPhase = new GlideRecord('release_phase');  
    grPhase.initialize();
    grPhase.name.setValue(phase);
    grPhase.order.setValue(order);
    order += 100;
    grPhase.release.setValue(current.sys_id);
    grPhase.planned_end_date.setValue(current.due_date);
    grPhase.priority.setValue(current.priority);
    var desc = grPhase.name.getDisplayValue() + ' phase for project ' + current.number + ' (' + current.short_description + ')';
    grPhase.short_description.setValue(desc);   
    grPhase.active.setValue(active);
    if (active == true) {
      grPhase.actual_start_date.setValue(gs.nowDateTime());  
    }
    active = false;
    grPhase.insert();     
  }
}
