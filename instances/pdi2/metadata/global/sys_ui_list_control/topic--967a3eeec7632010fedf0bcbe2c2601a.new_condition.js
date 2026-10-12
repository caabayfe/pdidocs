answer = !(gs.hasRole("taxonomy_admin") || sn_uc.UserCriteriaLoader.userMatches(gs.getUserID(), [parent.taxonomy.managers]) || new TopicPermissionUtil().isAnyTopicManager());
