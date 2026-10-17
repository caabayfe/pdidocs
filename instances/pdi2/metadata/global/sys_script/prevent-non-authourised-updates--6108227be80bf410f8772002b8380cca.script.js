
      (function executeRule(current, previous /*null when async*/) {
      
      var isTaxonomyAdminOrManager = gs.hasRole("taxonomy_admin") || sn_uc.UserCriteriaLoader.userMatches(gs.getUserID(), [current.taxonomy.managers]);
      if (current.parent_topic.changes()) { 
        if(!isTaxonomyAdminOrManager &&  gs.nil(current.parent_topic)) {
          gs.addErrorMessage(gs.getMessage("Users who are not Taxonomy admin or Taxonomy manager cannot create parent topic."));
          current.setAbortAction(true);
        }
      } 
      
      if(!(isTaxonomyAdminOrManager || current.canWrite())) {
        gs.addErrorMessage(gs.getMessage("Users who are not managers of parent taxonomy are not allowed to make changes in the topic."));
        current.setAbortAction(true);
      }
    })(current, previous);
