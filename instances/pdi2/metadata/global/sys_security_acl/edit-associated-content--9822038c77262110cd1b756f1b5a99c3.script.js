var m2mConnectedContentGr = new GlideRecord("m2m_connected_content");
answer = m2mConnectedContentGr.canCreate() || gs.hasRole("taxonomy_admin") || new global.TaxonomyUtil().isTaxonomyManagerOrContributor() || new global.TopicPermissionUtil().isAnyTopicManager() || new global.TopicPermissionUtil().isAnyTopicContributor();
