(function (finding, current) {
	finding.setCurrentSource(current);
	finding.setValue('finding_details', 'The "' + current.page + '" UI Page is public and can be accessed by users that are not logged in');
	finding.increment();
})(finding, current);
