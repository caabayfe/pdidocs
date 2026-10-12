answer = gs.hasRole("taxonomy_admin") || new global.TaxonomyUtil().isTaxonomyManager() || new global.TopicPermissionUtil().isAnyTopicManager();
