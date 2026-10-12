(function(){
	gs.debug("Attempting OOB NY landing page migration.");

	var nyCCRE = '4cc7a8297710330022f7f4d2681061b3';
	var nyTree = {
		"4cc7a8297710330022f7f4d2681061b3": [
			"24fd4f1473203300f7353c78caf6a716",
			"dafec35473203300f7353c78caf6a759",
			"344f475473203300f7353c78caf6a7ab",
			"63dec35473203300f7353c78caf6a754"
		]
	};
	var nyPermissions = [];
	var orlandoCCRE = 'f4ee6ecd236000100e4bc50947bf655d';

	UXFMigrationUtils.fixOOBNYLandingPage(nyCCRE, JSON.stringify(nyTree), nyPermissions, orlandoCCRE);
})();
