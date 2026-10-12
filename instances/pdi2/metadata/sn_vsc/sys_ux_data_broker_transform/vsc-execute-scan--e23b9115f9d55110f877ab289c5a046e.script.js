function transform(input) {
	// run scan for suite and return progress Id
	var scan = new sn_instance_scan.ScanInstance();
	return scan.triggerSuiteScan(input.suite);
}
