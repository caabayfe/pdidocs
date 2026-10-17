(function process(/*ResolverEnvironment*/ env) {
      var documentTable = env.getArguments()['documentTable'];
      var documentId = env.getArguments()['documentId'];

      if (!documentTable || !documentId) {
        return {
          result: false
        };
      }

      var userId = gs.getUser().getID();

      var utils = new sn_oe_sfs.SidebarParticipantSuggestionsUtils();
      return {
        result: utils.participantSuggestionsEnabled() && utils.participantSuggestionsConfigured()
          && utils.showParticipantSuggestions(documentTable, documentId, userId)
                && utils.displayUserGroups()
      };

})(env);
