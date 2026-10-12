function transform(input) {
	var output = {"health":"", "bootstraps": "", "portsHealth": ""};
	var hd = new HermesDiagnostics();
	output.health = JSON.parse(hd.getSetupStatus());
	output.bootstraps = JSON.parse(hd.getBootstraps());
	output.portsHealth = JSON.parse(hd.getTestPorts(false));
	return output;
}
