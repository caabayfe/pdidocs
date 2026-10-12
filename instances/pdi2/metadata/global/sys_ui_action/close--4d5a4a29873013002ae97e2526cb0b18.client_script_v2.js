function onClick(g_form) {
	getMessage("Are you sure you want to close this interaction?", function (msg) {
		g_modal.confirm(getMessage("Confirmation"), msg, function (confirmed) {
			if (confirmed) {
				g_form.setValue('state', 'closed_complete');
				g_form.save();
			}
		});
	});

	return false;
}
