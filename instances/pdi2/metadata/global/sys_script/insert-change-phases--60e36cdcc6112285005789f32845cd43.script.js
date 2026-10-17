if (current.operation() === 'insert' && !current.category.isNil())
		insertPhases(current);

//
// Auto add the change_phase records for the current change
//
function insertPhases(current) {
	var phases = current.phase.getChoices(current.category);
	var order = 100;
	var active = true;
	for (var i = 0; i < phases.size(); i++) {
		var phase = phases.get(i);
		var grPhase = new GlideRecord('change_phase');
		grPhase.initialize();
		grPhase.name = phase;
		grPhase.order = order;
		order += 100;
		grPhase.change = current.sys_id;
		grPhase.number = new NumberManager('change_phase').getNextNumber(phase);
		grPhase.priority = current.priority;
		var desc = grPhase.name.getDisplayValue() + ' phase for change ' + current.number + ' (' + current.short_description + ')';
		grPhase.short_description = desc;
		grPhase.active = active;
		active = false;
		grPhase.insert();
	}
}
