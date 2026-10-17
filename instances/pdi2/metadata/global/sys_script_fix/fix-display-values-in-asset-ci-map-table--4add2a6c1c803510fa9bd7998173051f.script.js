function fixDisplayValueEntries() {
	var script = 'global.AssetFixScriptUtil.fixDisplayValuesForAssetCIMapTables();';
	var name = 'Set display values in Asset-CI mapping tables';
	new global.AssetManagementBaseJob().runScriptByJob(script, '', name, '', '', false);
}

fixDisplayValueEntries();
