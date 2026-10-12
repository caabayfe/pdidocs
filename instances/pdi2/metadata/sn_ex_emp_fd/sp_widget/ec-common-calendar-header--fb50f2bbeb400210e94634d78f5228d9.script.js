(function () {
	data.schedulerConfig = input.schedulerConfig || options.schedulerConfig;
	data.messages = {
		'NEXT_DAY': gs.getMessage("Next day"),
		'PREV_DAY': gs.getMessage("Previous day"),
		'NEXT_WEEK': gs.getMessage("Next week"),
		'PREV_WEEK': gs.getMessage("Previous week"),
		'NEXT_MONTH': gs.getMessage("Next month"),
		'PREV_MONTH': gs.getMessage("Previous month"),
		'NEXT': gs.getMessage("Next"),
		'PREV': gs.getMessage("Previous")
	};
})();
