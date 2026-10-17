(function() {
	/* populate the 'data' object */
	data.i18n = {
		initialMessage: gs.getMessage('Please select a widget'),
		paMsgs: SNC.PAUtils.getMessages()
	};
	data.language = gs.getSession().getLanguage();
	data.dow = gs.getProperty('glide.ui.date_format.first_day_of_week', 1);
})();
