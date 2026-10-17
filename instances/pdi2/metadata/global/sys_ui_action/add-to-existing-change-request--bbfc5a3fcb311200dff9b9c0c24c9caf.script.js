function showSelectChangeDialog() {
	var title = g_list.getTitle();
	var listID = g_list.listID;
	var cis = g_list.getChecked().toString();

	if (cis) {
		var url = GlideURLBuilder.newGlideUrl('select_change_dialog_ui.do');
		url.addParam('selected_cis', cis);
		url.addParam('table_label', title);
		url.addParam('sysparm_nostack', 'no');

		var modal = new GlideModal('select_change_dialog_ui', false, 'modal-md', '');
		modal.setTitle(g_i18n.getMessage('Choose a Change Request'));
		modal.renderIframe(url.getURL(), function() {
			this.parent.jQuery('#select_change_dialog_ui').find('iframe').height('400');
			this.parent.jQuery('#select_change_dialog_ui').find('.modal-content').height('450');
		});

		CustomEvent.observe('chg.addToExisting.associate', function(answer) {
			if (answer) {
				answer = jQuery.parseJSON(answer);

				if (answer.processedCount !== 0) {
					if (Array.isArray(answer.messages))
						for (var i = 0; i < answer.messages.length; i++)
							g_notification.show('info', answer.messages[i]);

					GlideList.get(listID).clearChecked();
				}

				if (Array.isArray(answer.errors))
					for (var j = 0; j < answer.errors.length; j++)
						g_notification.show('error', answer.errors[j]);

				modal.destroy();
			}
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
