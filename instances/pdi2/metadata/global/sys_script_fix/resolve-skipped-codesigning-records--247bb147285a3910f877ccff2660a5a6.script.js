(function() {
		if (pm.isZboot())
			return;
		var jobScript = "new CodeSigningUpgradeResolver().updateRecords();";
		new GlideRunScriptJob().scheduleScriptOnThisNode(jobScript, "Resolve Skipped Turn on Code Signing Property Record", 40, new GlideDateTime());
		gs.info("Submitted job to resolve skipped codesigning records");
		})();
