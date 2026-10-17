(function executeRule(current, previous /*null when async*/) {

	if (current.name != previous.name) {
		var vtbBoard = new GlideRecord("vtb_board");
		vtbBoard.addQuery("sys_id", current.document);
		vtbBoard.query();
		
		if (vtbBoard.next()) {
			vtbBoard.setValue("name", current.name);
			vtbBoard.update();
		}
	}

})(current, previous);
