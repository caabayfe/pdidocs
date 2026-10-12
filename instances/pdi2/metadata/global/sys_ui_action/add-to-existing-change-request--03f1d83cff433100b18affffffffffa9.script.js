function showSelectChangeDialog() {
	var listID = g_list.listID;
	var cis = g_list.getChecked().toString();

	if (cis) {
		var modal = new GlideModal('select_change_dialog_ui');
		modal.setTitle(getMessage('Choose a Change Request'));
		modal.setPreference('selected_cis', cis);
		modal.setPreference('table_label', g_list.getTitle());
		modal.render();

		CustomEvent.observe('chg.addToExisting.associate', function(answer) {
			if (answer) {
				answer = answer.evalJSON();

				if (answer.processedCount !== 0) {

					if (Array.isArray(answer.messages))
						for (var j = 0; j < answer.messages.length; j++)
							GlideUI.get().addOutputMessage({
								msg: answer.messages[j],
								type: 'info'
							});

					var checkedIds = cis.split(',');
					for (var i = 0; i < checkedIds.length; i++)
						$('check_' + listID + '_' + checkedIds[i]).checked = false;

					$('allcheck_' + listID).checked = false;
				}

				if (Array.isArray(answer.errors))
					for (var k = 0; k < answer.errors.length; k++)
						GlideUI.get().addOutputMessage({
							msg: answer.errors[k],
							type: 'error'
						});
			}
			modal.destroy();
		});

		CustomEvent.observe('chg.addToExisting.cancel', function() {
			modal.destroy();
		});

		modal.on('beforeclose', function() {
			CustomEvent.unAll('chg.addToExisting.cancel');
			CustomEvent.unAll('chg.addToExisting.associate');
		});
	}
}
