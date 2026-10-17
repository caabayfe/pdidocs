function onBefore(current, previous) {
		var grChecklist = new GlideRecord('checklist');
		if (grChecklist.get(current.checklist)) {
			var grTask = new GlideRecord(grChecklist.table);
			if (grTask.get(grChecklist.document) && grTask.isValidField("work_notes")) {
				var worknote = gs.getMessage('Checklist item ');
				if (current.operation() == 'insert') {
					// CREATE
					worknote += gs.getMessage('added: ');
				} else if (current.operation() == 'delete') {
					// DELETE
					worknote += gs.getMessage('deleted: ');
				} else if (current.operation() == 'update') {
					// UPDATE
					// When Checklist Item completed / uncompleted, generate a work note for the associated task record
					if (current.complete != previous.complete) {
						if (current.complete == true)
							worknote += gs.getMessage('checked off: ');
						else
							worknote += gs.getMessage('unchecked: ');
					} else {
						worknote += gs.getMessage('updated: ');
					}
				}
				worknote += current.name;
				grTask.work_notes = worknote;
				grTask.update();
			}
		}
}
