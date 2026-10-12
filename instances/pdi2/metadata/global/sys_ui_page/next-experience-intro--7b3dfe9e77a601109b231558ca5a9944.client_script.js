	function nextExperienceButtonClick() {
		var dialogClass = typeof GlideModal != 'undefined' ? GlideModal : GlideDialogWindow;
		var dialog = new dialogClass('next_experience_confirm_dialog');
		var title = typeof GwtMessage !== 'undefined' ? new GwtMessage().getMessage('Are you sure you want to turn on Next Experience?') : 'Are you sure you want to turn on Next Experience?';
		dialog.setTitle(title);
		dialog.setWidth(600);
		dialog.setPreference('focusTrap', true);
		dialog.render();
	}
