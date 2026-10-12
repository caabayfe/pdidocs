(function executeRule(current, previous) {
	if (current.from_stockroom.changes()) {
		if (!gs.nil(current.from_stockroom.location)) {
			current.from_location = current.from_stockroom.location;
		} else {
			current.from_location = null;
		}
	}
	if (current.to_stockroom.changes()) {
		if (!gs.nil(current.to_stockroom.location)) {
			current.to_location = current.to_stockroom.location;
		} else {
			current.to_location = null;
		}
	}
}(current, previous));
