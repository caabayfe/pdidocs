(function executeRule(current, previous /*null when async*/ ) {

    // Determine whether to map only published articles to topics
    var mapOnlyPublishedArticlesToTopics = shouldMapOnlyPublishedArticles();

    if (shouldCopyRelatedTopics(current, previous, mapOnlyPublishedArticlesToTopics)) {
        copyRelatedTaxonomyTopics(current, mapOnlyPublishedArticlesToTopics);
    } else if (!mapOnlyPublishedArticlesToTopics && current.operation() == 'insert' && !gs.nil(current.base_version)) {
        copyTaxonomyTopicsMappingFromBaseVersion(current, mapOnlyPublishedArticlesToTopics);
    }

    function shouldMapOnlyPublishedArticles() {
        var propertyValue = gs.getProperty('assign_topics_for_pre_published_articles');
        return gs.nil(propertyValue) ? true : propertyValue === 'false';
    }

    function shouldCopyRelatedTopics(current, previous, mapOnlyPublishedArticlesToTopics) {
        return mapOnlyPublishedArticlesToTopics && current.workflow_state == 'published' &&
            previous.workflow_state != 'published' && current.operation() == 'update';
    }

    function copyRelatedTaxonomyTopics(currentKB, mapOnlyPublishedArticlesToTopics) {
        var KB_CONTENT_TYPE = '4c32a92153622010069addeeff7b12a3';
        var existingMappings = findExistingArticleTaxonomyMappings(currentKB.number, currentKB.sys_id);

        while (existingMappings.next()) {
            processMapping(currentKB, existingMappings, KB_CONTENT_TYPE, mapOnlyPublishedArticlesToTopics);
        }
    }

    function copyTaxonomyTopicsMappingFromBaseVersion(currentKB, mapOnlyPublishedArticlesToTopics) {
        var KB_CONTENT_TYPE = '4c32a92153622010069addeeff7b12a3';
        var existingMappings = findExistingArticleTaxonomyMappingsForBaseVersion(currentKB.base_version, currentKB.sys_id);

        while (existingMappings.next()) {
            processMapping(currentKB, existingMappings, KB_CONTENT_TYPE, mapOnlyPublishedArticlesToTopics);
        }
    }

    function findExistingArticleTaxonomyMappingsForBaseVersion(baseVersion, currentSysId) {
        var existingArticleTaxonomyMappingGr = new GlideAggregate('m2m_connected_content');
        existingArticleTaxonomyMappingGr.addAggregate('COUNT');
        existingArticleTaxonomyMappingGr.addQuery('knowledge.sys_id', baseVersion);
        existingArticleTaxonomyMappingGr.groupBy('topic');
        existingArticleTaxonomyMappingGr.query();
        return existingArticleTaxonomyMappingGr;
    }

    function findExistingArticleTaxonomyMappings(kbNumber, currentSysId) {
        var existingArticleTaxonomyMappingGr = new GlideAggregate('m2m_connected_content');
        existingArticleTaxonomyMappingGr.addAggregate('COUNT');
        existingArticleTaxonomyMappingGr.addQuery('knowledge.number', kbNumber);
        existingArticleTaxonomyMappingGr.addQuery('knowledge.sys_id', '!=', currentSysId);
        existingArticleTaxonomyMappingGr.groupBy('topic');
        existingArticleTaxonomyMappingGr.query();
        return existingArticleTaxonomyMappingGr;
    }

    function processMapping(currentKB, existingMapping, KB_CONTENT_TYPE, mapOnlyPublishedArticlesToTopics) {
        var checkoutArticleTaxonomyMappingGr = new GlideRecord('m2m_connected_content');
        checkoutArticleTaxonomyMappingGr.addQuery('knowledge', currentKB.sys_id);
        checkoutArticleTaxonomyMappingGr.addQuery('topic', existingMapping.topic);
        checkoutArticleTaxonomyMappingGr.query();

        if (!checkoutArticleTaxonomyMappingGr.next()) {
            createNewMapping(checkoutArticleTaxonomyMappingGr, currentKB, existingMapping, KB_CONTENT_TYPE);
        }

        if (mapOnlyPublishedArticlesToTopics) {
            updateNewVersionForFeaturedContent(currentKB.getUniqueValue(), currentKB.number, checkoutArticleTaxonomyMappingGr.getUniqueValue(), existingMapping.topic);
        }
    }

    function createNewMapping(mappingGr, currentKB, existingMapping, KB_CONTENT_TYPE) {
        var baseArticleMapping = null;
        if (!gs.nil(currentKB.base_version)) {
            baseArticleMapping = getBaseArticleMapping(currentKB.base_version, existingMapping.topic, KB_CONTENT_TYPE);
        }
        mappingGr.initialize();
        mappingGr.setValue('content_type', KB_CONTENT_TYPE);
        mappingGr.setValue('knowledge', currentKB.sys_id);
        mappingGr.setValue('topic', existingMapping.topic);
        mappingGr.setValue('popularity', existingMapping.popularity);
		
        if (!gs.nil(baseArticleMapping)) {
            mappingGr.setValue('order', baseArticleMapping.order);
            mappingGr.setValue('source', baseArticleMapping.source);
        }
        mappingGr.insert();

        updateDomain(currentKB.sys_domain, mappingGr.getUniqueValue());
    }

    function getBaseArticleMapping(kbId, topicId, KB_CONTENT_TYPE) {
        var mappingGr = new GlideRecord("m2m_connected_content");
        mappingGr.addQuery('content_type', KB_CONTENT_TYPE);
        mappingGr.addQuery('knowledge', kbId);
        mappingGr.addQuery('topic', topicId);
        mappingGr.setLimit(1);
        mappingGr.query();
        if (mappingGr.next()) {
            return mappingGr;
        }
        return null;
    }

    function updateDomain(domain, mappingSysId) {
        if (gs.getProperty("glide.sys.domain.partitioning") === 'true') {
            var domainGr = new GlideRecord("m2m_connected_content");
            if (domainGr.get(mappingSysId)) {
                domainGr.setValue('sys_domain', domain);
                domainGr.update();
            }
        }
    }

    function updateNewVersionForFeaturedContent(currentKbSysId, currentKbNumber) {
        var KB_CONTENT_TYPE = '4c32a92153622010069addeeff7b12a3';
        var checkoutArticleTaxonomyMappingGr = new GlideRecord('m2m_connected_content');
        checkoutArticleTaxonomyMappingGr.addQuery('knowledge.sys_id', currentKbSysId);
        checkoutArticleTaxonomyMappingGr.addQuery('content_type', KB_CONTENT_TYPE);
        checkoutArticleTaxonomyMappingGr.query();

        while (checkoutArticleTaxonomyMappingGr.next()) {
            updateFeaturedContent(currentKbSysId, currentKbNumber, checkoutArticleTaxonomyMappingGr.getUniqueValue(), checkoutArticleTaxonomyMappingGr.topic);
        }
    }

    function updateFeaturedContent(currentKbSysId, currentKbNumber, newContentSysId, topic) {
        var featuredContentGr = new GlideRecord('featured_content');
        featuredContentGr.addQuery('connected_content.knowledge', '!=', currentKbSysId);
        featuredContentGr.addQuery('connected_content.knowledge.number', currentKbNumber);
        featuredContentGr.addQuery('connected_content.topic', topic);
        featuredContentGr.setValue('connected_content', newContentSysId);
        featuredContentGr.updateMultiple();
    }

})(current, previous);
