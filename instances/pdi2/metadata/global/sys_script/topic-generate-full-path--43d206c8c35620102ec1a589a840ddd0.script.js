function onAsync(current) {
    var sessionLang = gs.getSession().getLanguage();
    var parentChanged = current.parent_topic.changes();
    var nameChanged = current.name.changes();
    new global.TopicPathTranslationsUtil().handleTopicPathTranslationsForSubtree(
        current.getUniqueValue(),
        current.getValue('taxonomy'),
        parentChanged,
        nameChanged,
        sessionLang
    );
}
