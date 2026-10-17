(function executeRule(current, previous /*null when async*/ ) {

    if (current.name) {
		// Convert the attribute's name to lowercase letters
        current.name = current.name.toLowerCase();
    }

})(current, previous);
