(function (finding, current) {
	finding.setCurrentSource(current);
	finding.setValue('finding_details', 'The "' + current.title + '" Service Portal Page is set to be public and may be accessible to unauthenticated users.');
	finding.increment();
})(finding, current);
