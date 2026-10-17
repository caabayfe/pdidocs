(function (finding, current) {
	finding.setCurrentSource(current);
	finding.setValue('finding_details', '' + current.sys_scope.name  + "'s WebService named \"" + current.name  + "\" on the URL \"" + current.operation_uri + "\" does not require authentication and is available publicly."); // Programmatically add unique output per finding (output is a str).
    finding.increment();
})(finding, current);
