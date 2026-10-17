answer = gs.hasRole("taxonomy_admin") || new global.TaxonomyUtil().isTaxonomyManager(current.taxonomy) || new global.TopicPermissionUtil().isTopicManager(current.getUniqueValue());
