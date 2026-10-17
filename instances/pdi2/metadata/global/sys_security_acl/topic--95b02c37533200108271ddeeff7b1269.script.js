answer = gs.hasRole("taxonomy_admin") || new global.TaxonomyUtil().isTaxonomyManager(current.taxonomy);
if (current.isNewRecord() && current.parent_topic.toString()) {
    answer = answer || new global.TopicPermissionUtil().isTopicManager(current.parent_topic.toString());
} else {
    answer = answer || new global.TopicPermissionUtil().isTopicManager(current.getUniqueValue());
}
