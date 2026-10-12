if (new GlideDomainPathProvider().isInstalled()) {
	GlideDomainPathUpdater.get().updateDomainPaths(false);
	var pathValidator = new GlideDomainPathValidator();
	pathValidator.setUpdateProgress(false);
	pathValidator.checkDomainTableConsistency(false);
	pathValidator.checkDomainPathFieldOnDomainSeparatedTables(false);
}
