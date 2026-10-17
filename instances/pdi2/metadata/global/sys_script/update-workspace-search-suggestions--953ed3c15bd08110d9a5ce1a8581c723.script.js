(function executeRule(current, previous /*null when async*/ ) {
    var configService = new WorkspaceSearchConfigurationService();
    configService.copyLegacySuggestionsForPolaris();
})(current, previous);
