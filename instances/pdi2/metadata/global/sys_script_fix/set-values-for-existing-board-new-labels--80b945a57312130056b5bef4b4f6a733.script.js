(function() {
	var boards = new GlideRecord('vtb_board');
	boards.setValue('label_6', gs.getMessage('vtb_label_6'));
	boards.setValue('label_7', gs.getMessage('vtb_label_7'));
	boards.setValue('label_6_active', true);
	boards.setValue('label_7_active', true);
	boards.updateMultiple();
})();
