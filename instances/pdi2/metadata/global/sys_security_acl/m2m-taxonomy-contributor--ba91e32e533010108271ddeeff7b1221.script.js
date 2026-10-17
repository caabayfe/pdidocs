answer = gs.hasRole("taxonomy_admin") || (gs.hasRole("user_criteria_admin") && sn_uc.UserCriteriaLoader.userMatches(gs.getUserID(), [current.taxonomy.managers]));
