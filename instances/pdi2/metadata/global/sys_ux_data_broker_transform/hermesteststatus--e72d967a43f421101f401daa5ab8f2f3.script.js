function transform(input) {
	var output = {};
	var service = input.args;
	// gs.log();
	var hd = new HermesDiagnostics();
	output = JSON.parse(hd.getTestMessageForService(service));
	return output;
}
