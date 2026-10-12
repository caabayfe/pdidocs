var TopicSecurityUtilSNC = Class.create();
TopicSecurityUtilSNC.prototype = {
    initialize: function() {
        //content type ids for catalog items and knowledge as only they contribute to popularity of topic 
        this.KNOWLEDGE_CONTENT_TYPE = '4c32a92153622010069addeeff7b12a3';
        this.CATALOG_CONTENT_TYPE = '98f9a16553622010069addeeff7b1248';
        this.contentConfigMapGr = this._getContentConfigMap();

    },

    _getContentConfigMap: function() {
        var contentTypeFilter = this.KNOWLEDGE_CONTENT_TYPE + ',' + this.CATALOG_CONTENT_TYPE;
        var contentConfigMapGr = new GlideRecord('taxonomy_content_configuration');
        contentConfigMapGr.addQuery('sys_id', 'IN', contentTypeFilter);
        contentConfigMapGr.query();
        return contentConfigMapGr;
    },

    _canView: function(contentGr, contentType, isMobile) {
        if (contentType === this.KNOWLEDGE_CONTENT_TYPE) {
            return new global.KnowledgeContentProcessor().canView(contentGr.knowledge, gs.getUserID(), isMobile);
        } else if (contentType === this.CATALOG_CONTENT_TYPE) {
            return new global.CatalogContentProcessor().canView(contentGr.catalog_item, gs.getUserID(), isMobile);
        } else {
            return false;
        }
    },

    isTopicAdmin: function() {
        var answer = false;
        if (gs.getProperty("taxonomy.knowledge.translation.tokyo")) {
            answer = new global.TopicPermissionUtil().isAnyTopicManager() ||
                new global.TopicPermissionUtil().isAnyTopicContributor();
        }
        return answer;
    },

    /*
     * Returns true or false whether a user has access to view the topic
     * @param String - topicId
     * @param boolean - isMobile
     * @return Boolean 
     */
    canViewTopic: function(topicId, isMobile) {
        while (this.contentConfigMapGr.next()) {
            var contentGr = this._prepareConnectedContentQuery(topicId, this.contentConfigMapGr);
            contentGr.query();
            while (contentGr.next()) {
                var canView = this._canView(contentGr, contentGr.getValue('content_type'), isMobile);
                if (canView) {
                    return true;
                }
            }
        }
        return false;
    },


    canViewTopicAdvanced: function(topicId, isMobile) {
        while (this.contentConfigMapGr.next()) {
            if (this.contentConfigMapGr.getUniqueValue() !== this.KNOWLEDGE_CONTENT_TYPE) {
                var contentGr = this._prepareConnectedContentQuery(topicId, this.contentConfigMapGr);
                contentGr.query();
                while (contentGr.next()) {
                    var canView = this._canView(contentGr, contentGr.getValue('content_type'), isMobile);
                    if (canView) {
                        return true;
                    }
                }
            } else {
                var preferredLanguage = gs.getSession().getLanguage();
                var fallBackLanguage = gs.getProperty('glide.sys.language');
                var evaluatedArticles = {};
                var accessibleKnowledgeBases = this.fetchKnowledgeBaseFromSession();

                var preferredkbGr = this._prepareConnectedContentQuery(topicId, this.contentConfigMapGr);
                preferredkbGr.addQuery('knowledge.language', preferredLanguage);
                preferredkbGr.addQuery('knowledge.kb_knowledge_base', 'IN', accessibleKnowledgeBases);
                preferredkbGr.query();
                while (preferredkbGr.next()) {
                    canView = this._canView(preferredkbGr, preferredkbGr.getValue('content_type'), isMobile);
                    evaluatedArticles[preferredkbGr.getUniqueValue()] = true;
                    var parentArticle = preferredkbGr.getValue('parent');
                    if (parentArticle)
                        evaluatedArticles[parentArticle] = true;
                    if (canView) {
                        return true;
                    }
                }

                if (preferredLanguage != fallBackLanguage) {
                    var fallbackKbGr = this._prepareConnectedContentQuery(topicId, this.contentConfigMapGr);
                    fallbackKbGr.addQuery('knowledge.language', fallBackLanguage);
                    fallbackKbGr.addQuery('knowledge.kb_knowledge_base', 'IN', accessibleKnowledgeBases);
                    fallbackKbGr.query();
                    while (fallbackKbGr.next()) {
                        if (evaluatedArticles[fallbackKbGr.getValue('parent')])
                            continue;
                        canView = this._canView(fallbackKbGr, fallbackKbGr.getValue('content_type'), isMobile);
                        if (canView) {
                            return true;
                        }
                    }
                }
            }
        }
        return false;
    },

    _prepareConnectedContentQuery: function(topicId, contentConfigMapGr) {
        var m2mGr = new GlideRecord('m2m_connected_content');
        m2mGr.addQuery('topic', topicId);
        m2mGr.addQuery('content_type', contentConfigMapGr.getUniqueValue());
        m2mGr.addEncodedQuery(contentConfigMapGr.content_filter);
        return m2mGr;
    },
	
	/*
     * Returns accessible knowledge base for a user associated to taxonomy from session
     * @return Knowledge Bases
     */
	
    fetchKnowledgeBaseFromSession: function() {
        var session = gs.getSession();
        var accessibleKnowldgeBase = session.getClientData('taxonomy_knowledge_bases');
        if (accessibleKnowldgeBase === null) {
            accessibleKnowldgeBase = this.fetchAcessibleKnowledgeBase();
            session.putClientData('taxonomy_knowledge_bases', accessibleKnowldgeBase);
        }
        return accessibleKnowldgeBase;
    },


    /*
     * Returns accessible knowledge base for a user associated to taxonomy
     * @return Knowledge Bases
     */
    fetchAcessibleKnowledgeBase: function() {
        var accessibleKnowldgeBase = [];
        var kbGr = new GlideAggregate('kb_knowledge');
        kbGr.addNotNullQuery('taxonomy_topic');
        kbGr.addQuery('workflow_state', 'published');
        kbGr.groupBy("kb_knowledge_base");
        kbGr.query();
        while (kbGr.next()) {
            var kbRecord = kbGr.kb_knowledge_base.getRefRecord();
            if (kbRecord.canRead())
                accessibleKnowldgeBase.push(kbRecord.sys_id);
        }
        return accessibleKnowldgeBase;
    },

    /*
     * Returns true if current user can access the topic page.
     * @param GlideRecord - gr - reference of GlideRecord of topic record.
     * @param boolean - isMobile - check for mobile device
     * @return boolean current user access to the given record.
     */
    checkTopicAccessForCurrentUser: function(gr, isMobile) {
        if (gr.isValidRecord() && gr.getValue('active') === "1") {
            if(gr.isValidField('enable_user_criteria_check') && gr.getValue('enable_user_criteria_check') === "1") {
                var topicAccessData = {
                        available_for: gr.getValue('available_for'),
                        not_available_for: gr.getValue('not_available_for')
                    };
                return new PopularTopicsUtil().checkCurrentUserAccessForTopic(topicAccessData);
            } else
                return true;
        }
        return false;
    },

    type: 'TopicSecurityUtilSNC'
};
