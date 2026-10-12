function transform(input) {
	// Run scan for suite and return progress Id
	var scan = new sn_instance_scan.ScanInstance();
	return scan.triggerTestScan(input.check, input.table);
}
