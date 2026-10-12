(function (finding, current) {

	while (current.next()) {
		if (current.isValid() && current.isValidRecord() && current.user.active == true) {
			finding.setCurrentSource(current);
			finding.increment();
		}
	}

})(finding, current);
