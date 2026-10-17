function onBefore(current) {
	var grTask = new GlideRecord(current.table);
	if (grTask.get(current.document) && grTask.isValidField("work_notes")) {
		var worknote;
		if (current.operation() == 'insert') {
			// CREATE
			worknote = gs.getMessage('Checklist created');
		} else if (current.operation() == 'delete') {
			// DELETE
			worknote = gs.getMessage('Checklist deleted');
		}
		grTask.work_notes = worknote;
		grTask.update();	
	}
}
