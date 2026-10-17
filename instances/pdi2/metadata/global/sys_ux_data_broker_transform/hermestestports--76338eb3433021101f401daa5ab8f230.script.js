function transform(input) {
	var hd = new HermesDiagnostics();
	output = JSON.parse(hd.getTestPorts(true));
	return output;
}
