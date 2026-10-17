(function(){
	gs.debug("Attempting OOB NY landing page migration.");

	var nyCCRE = '8a58283f532c330083f3ddeeff7b12c3';
	var nyTree = {
		"8a58283f532c330083f3ddeeff7b12c3": [
			"b678283f532c330083f3ddeeff7b12b4",
			"d789a87f532c330083f3ddeeff7b12c0"
		],
		b678283f532c330083f3ddeeff7b12b4: [
			"77f8a07f532c330083f3ddeeff7b1220",
			"99b8ac3f532c330083f3ddeeff7b127f",
			"a039647f532c330083f3ddeeff7b128f",
			"b959a47f532c330083f3ddeeff7b129b"
		],
		d789a87f532c330083f3ddeeff7b12c0: ["5fb96c7f532c330083f3ddeeff7b1200"]
	};
	var nyPermissions = ['4114ce4753703300e4e9ddeeff7b1203'];
	var orlandoCCRE = 'd287f749232000100e4bc50947bf6596';

	UXFMigrationUtils.fixOOBNYLandingPage(nyCCRE, JSON.stringify(nyTree), nyPermissions, orlandoCCRE);
})();
