(function (finding, current) {
	var eq = '^NQrole=2831a114c611228501d4ea6c309d626d^contains=22878663ff123100158bffffffffff8d';
	current.addEncodedQuery(eq);
	current.query();
	while (current.next()) {
		finding.setCurrentSource(current);
		finding.increment();
	}
})(finding, current);
