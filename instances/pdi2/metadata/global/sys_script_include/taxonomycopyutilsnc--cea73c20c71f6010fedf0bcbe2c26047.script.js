var TaxonomyCopyUtilSNC = Class.create();
TaxonomyCopyUtilSNC.prototype = {
    initialize: function() {
        this.contentRefFieldMap = new global.ContentConfigUtil().getContentReferenceFieldMap(true);
        this.categoryRefFieldMap = new global.ContentConfigUtil().getCategoryReferenceFieldMap(true);
        this.oldToNewTopicMap = [];
        this.traversedOldTopicList = [];
        this.traversedNewTopicList = [];
    },
    /**
     * Copies taxonomy and its topic, contributors, connected content and featured content
     * @param oldTaxonomyId
     * @param newTaxonomyName
     * returns the new TaxonomyId
     */
    copyTaxonomyTree: function(oldTaxonomyId, newTaxonomyName) {
        var taxonomyGr = new GlideRecord('taxonomy');
        taxonomyGr.get(oldTaxonomyId);
        var newTaxonomyId = this._copyTaxonomy(taxonomyGr, newTaxonomyName);
        if (newTaxonomyId) {
            this._copyContributorsForTaxonomy(oldTaxonomyId, newTaxonomyId);
            this._copyRootTopics(oldTaxonomyId, newTaxonomyId, true);
        }
        return newTaxonomyId;
    },

    /**
     * Copies a topic tree and its contributors, connected content and featured content.
     * @param oldTopicId
     * @param newTaxonomyId-  destination taxonomy id
     * @param newParentTopicId- destination parent topic id
     * @param preserveTopicName- if true, the original topic name will be preserved
     * returns the new TaxonomyId
     */
    copyTopicTree: function(oldTopicId, newTaxonomyId, newParentTopicId, preserveTopicName) {
        var oldTopicGr = new GlideRecord('topic');
        oldTopicGr.get(oldTopicId);
        var isParentActive;
        newParentTopicId += '';

        if (!gs.nil(newParentTopicId)) {
            var parentTopicGr = new GlideRecord('topic');
            parentTopicGr.get(newParentTopicId);
            isParentActive = parentTopicGr.active;
        } else {
            var taxonomyGr = new GlideRecord('taxonomy');
            taxonomyGr.get(newTaxonomyId);
            isParentActive = taxonomyGr.active;
        }
        var newTopicId = this._copyTopic(oldTopicGr, newTaxonomyId, newParentTopicId, isParentActive, preserveTopicName);
        return newTopicId;
    },

    _copyTaxonomy: function(oldTaxonomyGr, newTaxonomyName) {
        var newTaxonomyGr = new GlideRecord("taxonomy");
        newTaxonomyGr.name = newTaxonomyName;
        newTaxonomyGr.managers = oldTaxonomyGr.managers;
        newTaxonomyGr.description = oldTaxonomyGr.description;
        newTaxonomyGr.active = oldTaxonomyGr.active;
        return newTaxonomyGr.insert();
    },

    _copyRootTopics: function(oldTaxonomyId, newTaxonomyId, preserveTopicName) {
        var gr = new GlideRecord("topic");
        gr.addQuery("taxonomy", oldTaxonomyId);
        gr.addNullQuery("parent_topic");
        gr.query();
        while (gr.next())
            this._copyTopic(gr, newTaxonomyId, "", undefined, preserveTopicName);
    },

    _copyChildTopics: function(oldTopicId, newTopicId, newTaxonomyId, isParentActive, preserveTopicName) {
        var gr = new GlideRecord("topic");
        gr.addQuery("parent_topic", oldTopicId);
        gr.addQuery("sys_id", "NOT IN", this.traversedNewTopicList);
        gr.query();
        while (gr.next())
            this._copyTopic(gr, newTaxonomyId, newTopicId, isParentActive, preserveTopicName);
    },

    _copyTopic: function(oldTopicGr, newTaxonomyId, newParentTopicId, isParentActive, preserveTopicName) {
        var oldTopicId = oldTopicGr.getUniqueValue();
        var oldIcon = oldTopicGr.getValue("icon");
        var oldBanner = oldTopicGr.getValue("banner_image");

        var topicGr = new GlideRecord("topic");
        var parentTopicExists = topicGr.get(newParentTopicId);

        var newTopicGr = new GlideRecord("topic");
        newTopicGr.name = preserveTopicName ? oldTopicGr.name : gs.getMessage('Copy of {0}', oldTopicGr.name);
        newTopicGr.order = oldTopicGr.order;
        newTopicGr.description = oldTopicGr.description;
        newTopicGr.topic_based_navigation = oldTopicGr.topic_based_navigation;
        newTopicGr.taxonomy = newTaxonomyId;
        newTopicGr.template = oldTopicGr.template;
        newTopicGr.active = oldTopicGr.active;
        newTopicGr.parent_topic = newParentTopicId;
        newTopicGr.icon = '';
        newTopicGr.banner_image = '';
        newTopicGr.icon_url = oldTopicGr.icon_url;
        newTopicGr.banner_image_url = oldTopicGr.banner_image_url;
        newTopicGr.enable_user_criteria_check = parentTopicExists ? topicGr.enable_user_criteria_check : oldTopicGr.enable_user_criteria_check;
        newTopicGr.available_for = parentTopicExists ? topicGr.available_for : oldTopicGr.available_for;
        newTopicGr.not_available_for = parentTopicExists ? topicGr.not_available_for : oldTopicGr.not_available_for;
        newTopicGr.topic_manager = parentTopicExists ? topicGr.topic_manager : '';
        newTopicGr.topic_contributor = parentTopicExists ? topicGr.topic_contributor : '';

        if (!gs.nil(isParentActive) && !isParentActive)
            newTopicGr.active = false;

        var newTopicId = newTopicGr.insert();

        if (newTopicId) {
            this.oldToNewTopicMap[oldTopicId] = newTopicId;
            this.traversedOldTopicList.push(oldTopicId);
            this.traversedNewTopicList.push(newTopicId);
            if (!gs.nil(oldIcon) || !gs.nil(oldBanner)) {
                var copiedImages = this._copyTopicImage(oldTopicId, newTopicId);
                this._updateTopicImages(oldIcon, oldBanner, newTopicId, copiedImages);
            }
            this._copyChildTopics(oldTopicId, newTopicId, newTaxonomyId, isParentActive, preserveTopicName);
            this._copyConnectedContentForTopic(oldTopicId, newTopicId);
            this._copyConnectedCategoriesForTopic(oldTopicId, newTopicId);
            this._copyUnconnectedCategoryContentForTopic(oldTopicId, newTopicId);
            if (GlidePluginManager.isActive('com.snc.guided_help')) {
                this._copyGuidedSelfServiceProcessForTopic(oldTopicId, newTopicId);
            }
        }

        return newTopicId;
    },

    _copyContributorsForTaxonomy: function(oldTaxonomyId, newTaxonomyId) {
        var gr = new GlideRecord("m2m_taxonomy_contributor");
        gr.addQuery("taxonomy", oldTaxonomyId);
        gr.query();
        while (gr.next())
            this._copyContributors(gr, newTaxonomyId);
    },

    _copyContributors: function(oldContributorGr, newTaxonomyId) {
        var newContributorGr = new GlideRecord("m2m_taxonomy_contributor");
        newContributorGr.contributors = oldContributorGr.contributors;
        newContributorGr.taxonomy = newTaxonomyId;
        return newContributorGr.insert();
    },

    _copyTopicImage: function(oldTopicId, newTopicId) {
        var topicTableName = "topic";
        var topicImageTableName = "ZZ_YY" + topicTableName;
        var attach = new GlideSysAttachment();
        var copiedImages = attach.copy(topicImageTableName, oldTopicId, topicTableName, newTopicId);
        return copiedImages;
    },

    _updateTopicImages: function(oldIcon, oldBanner, newTopicId, copiedImages) {
        var newGr = new GlideRecord('topic');
        newGr.get(newTopicId);
        copiedImages = copiedImages.toArray();
        var newBanner = '';
        var newIcon = '';
        for (var i = 0; i < copiedImages.length; i++) {
            var oldandnew = copiedImages[i].split(',');
            if (oldandnew[0] == oldIcon)
                newGr.setValue('icon', oldandnew[1]);
            else if (oldandnew[0] == oldBanner)
                newGr.setValue('banner_image', oldandnew[1]);
        }
        newGr.update();
    },

    _copyConnectedContentForTopic: function(oldTopicId, newTopicId) {
        var gr = new GlideRecord("m2m_connected_content");
        gr.addQuery("topic", oldTopicId);
        gr.query();
        while (gr.next()) {
            var newConnectedContentId = this._copyConnectedContent(gr, newTopicId);
            if (newConnectedContentId)
                this._copyFeaturedContentForTopic(gr.getUniqueValue(), newConnectedContentId);
        }
    },

    _copyGuidedSelfServiceProcessForTopic: function(oldTopicId, newTopicId) {
        var gr = new GlideRecord("sn_ex_sp_gd_help_m2m_process_topic");
        gr.addQuery("topic", oldTopicId);
        gr.query();
        while (gr.next()) {
            this._copyConnectedGuidedSelfServiceProcess(gr, newTopicId);
        }
    },

    _copyUnconnectedCategoryContentForTopic: function(oldTopicId, newTopicId) {
        var gr = new GlideRecord("unconnected_category_content");
        gr.addQuery("topic", oldTopicId);
        gr.query();
        while (gr.next())
            this._copyUnconnectedCategoryContent(gr, newTopicId);
    },

    _copyUnconnectedCategoryContent: function(oldUnconnectedCategoryContent, newTopicId) {
        var newUnconnectedCategoryContentGr = new GlideRecord("unconnected_category_content");
        var contentType = oldUnconnectedCategoryContent.content_type.toString();
        var contentRefField = this.contentRefFieldMap[contentType];
        var categoryRefField = this.categoryRefFieldMap[contentType];
        newUnconnectedCategoryContentGr.setValue("content_type", contentType);
        newUnconnectedCategoryContentGr.setValue(contentRefField, oldUnconnectedCategoryContent.getValue(contentRefField));
        newUnconnectedCategoryContentGr.setValue(categoryRefField, oldUnconnectedCategoryContent.getValue(categoryRefField));
        newUnconnectedCategoryContentGr.setValue("topic", newTopicId);
        newUnconnectedCategoryContentGr.setValue("update_type", oldUnconnectedCategoryContent.getValue("update_type"));
        return newUnconnectedCategoryContentGr.insert();
    },

    _copyConnectedCategoriesForTopic: function(oldTopicId, newTopicId) {
        var gr = new GlideRecord("m2m_connected_category");
        gr.addQuery("topic", oldTopicId);
        gr.query();
        while (gr.next())
            this._copyConnectedCategory(gr, newTopicId);
    },

    _copyConnectedCategory: function(oldConnectedCategory, newTopicId) {
        var newConnectedCategoryGr = new GlideRecord("m2m_connected_category");
        var contentType = oldConnectedCategory.content_type;
        var contentRefField = this.contentRefFieldMap[contentType];
        var categoryRefField = this.categoryRefFieldMap[contentType];
        newConnectedCategoryGr.setValue("content_type", contentType);
        newConnectedCategoryGr.setValue(categoryRefField, oldConnectedCategory.getValue(categoryRefField));
        newConnectedCategoryGr.setValue("topic", newTopicId);
        newConnectedCategoryGr.setValue("order", oldConnectedCategory.order);
        return newConnectedCategoryGr.insert();
    },

    _copyConnectedContent: function(oldConnectedContentGr, newTopicId) {
        var newConnectedContentGr = new GlideRecord("m2m_connected_content");
        var contentType = oldConnectedContentGr.content_type;
        var contentRefField = this.contentRefFieldMap[contentType];
        var contentItem = oldConnectedContentGr.getValue(contentRefField);
        newConnectedContentGr.setValue("content_type", contentType);
        newConnectedContentGr.setValue(contentRefField, contentItem);
        newConnectedContentGr.setValue("topic", newTopicId);
        newConnectedContentGr.setValue("order", oldConnectedContentGr.order);
        newConnectedContentGr.setValue("source", oldConnectedContentGr.source);
        return newConnectedContentGr.insert();
    },

    _copyConnectedGuidedSelfServiceProcess: function(oldConnectedProcessGr, newTopicId) {
        var newConnectedProcessGr = new GlideRecord("sn_ex_sp_gd_help_m2m_process_topic");
        newConnectedProcessGr.setValue("guided_help_process", oldConnectedProcessGr.guided_help_process);
        newConnectedProcessGr.setValue("topic", newTopicId);
        newConnectedProcessGr.setValue("order", oldConnectedProcessGr.order);
        newConnectedProcessGr.insert();
    },

    _copyFeaturedContentForTopic: function(oldConnectedContentId, newConnectedContentId) {
        var gr = new GlideRecord('featured_content');
        gr.addQuery('connected_content', oldConnectedContentId);
        gr.addQuery('topic', this.traversedOldTopicList);
        gr.query();
        while (gr.next()) {
            var newTopicId = this.oldToNewTopicMap[gr.topic];
            this._copyFeaturedContent(gr, newConnectedContentId, newTopicId);
        }
    },

    _copyFeaturedContent: function(oldFeaturedContentGr, newConnectedContentId, newTopicId) {
        var newFeaturedContentGr = new GlideRecord("featured_content");
        newFeaturedContentGr.connected_content = newConnectedContentId;
        newFeaturedContentGr.topic = newTopicId;
        newFeaturedContentGr.order = oldFeaturedContentGr.order;
        return newFeaturedContentGr.insert();
    },

    type: 'TaxonomyCopyUtilSNC'
};
