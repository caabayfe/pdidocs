var ApplicationFileBuilder = (function() {
	return {
		build: function(applicationSysId, fileIds, tableName) {
			AccessValidator.verifyApplicationAccess(applicationSysId);

			return FileDataBuilder.buildProvidedFiles(applicationSysId, fileIds, tableName);
		}
	};
	
})();
