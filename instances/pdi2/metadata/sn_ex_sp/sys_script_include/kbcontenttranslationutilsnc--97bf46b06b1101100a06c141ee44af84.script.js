var KBContentTranslationUtilSNC = Class.create();
KBContentTranslationUtilSNC.prototype = {
    initialize: function() {
        this.KB_TABLE = 'kb_knowledge';
        this.CONTENT_TABLE = 'm2m_connected_content';
        this.SCRIPT_INCLUDE_TABLE = 'sys_script_include';
    },

    _insertConnectedContent: function(contentGr, kbId) {
        var newContentGr = new GlideRecord(this.CONTENT_TABLE);
        newContentGr.addQuery('knowledge', kbId);
        newContentGr.addQuery('topic', contentGr.getValue('topic'));
        newContentGr.query();
        if (!newContentGr.next()) {
            newContentGr.initialize();
            newContentGr.setValue('topic', contentGr.getValue('topic'));
            newContentGr.setValue('knowledge', kbId);
            newContentGr.setValue('order', contentGr.getValue('order'));
            newContentGr.setValue('content_type', contentGr.getValue('content_type'));
            if (newContentGr.isValidField('source')) {
                newContentGr.setValue('source', contentGr.getValue('source'));
            }
            newContentGr.insert();
            gs.info(kbId + ' was added to topic ' + '(' + contentGr.getValue('topic') + ')');
        }
    },

    /**
     * Returns boolean if there exists any article with same KB number.
     * @param kbGr referece of the current record.
     */
    hasExistingKBarticleWithSameNumber: function(kbGr) {
        var gr = new GlideAggregate(this.KB_TABLE);
        gr.addAggregate('count');
        gr.addQuery('number', kbGr.getDisplayValue('number'));
        gr.addQuery('sys_id', 'NOT IN', kbGr.getValue('sys_id'));
        gr.query();
        if (gr.next()) {
            var count = gr.getAggregate('count');
            if (count > 0) {
                return true;
            }
            return false;
        }
        return false;
    },
    /*
     * Returns translated versions of a Knowledge connected content
     */
    getTranslatedVersionsFromSysId: function(kbSysId) {
        var kbGr = this.getKbGr(kbSysId);
        if (!kbGr) {
            return null;
        }
        return this.getTranslatedVersionsFromGr(kbGr, null);
    },
    getTranslatedVersionsFromGr: function(kbGr, language) {
        var scriptIncludeGr = new GlideRecord(this.SCRIPT_INCLUDE_TABLE);
        scriptIncludeGr.get('a9e307e653ae3010b6eaddeeff7b122f');
        var translatedVersionsEncodedQuery = scriptIncludeGr.hasNext() ? new global.KBTranslation().getTranslatedVersionEncodedQuery(kbGr) :
            this.getTranslatedVersionEncodedQuery(kbGr);
        var translatedVersionsGr = new GlideRecord(this.KB_TABLE);
        translatedVersionsGr.addEncodedQuery(translatedVersionsEncodedQuery);
        if (!gs.nil(language)) {
            translatedVersionsGr.addQuery('language', language);
        }
        translatedVersionsGr.query();
        return translatedVersionsGr;
    },
    getKbGr: function(kbSysId) {
        var kbGr = new GlideRecord(this.KB_TABLE);
        kbGr.get(kbSysId);
        return kbGr;
    },
    addTranslatedVersionsToTopic: function(contentGr) {
        var translatedVersionsGr = this.getTranslatedVersionsFromSysId(contentGr.getValue('knowledge'));
        while (translatedVersionsGr.next()) {
            this._insertConnectedContent(contentGr, translatedVersionsGr.getUniqueValue());
        }
    },
    removeTranslatedVersionsFromTopic: function(contentGr) {
        var translatedVersionsGr = this.getTranslatedVersionsFromSysId(contentGr.getValue('knowledge'));
        while (translatedVersionsGr.next()) {
            var delContentGr = new GlideRecord(this.CONTENT_TABLE);
            delContentGr.addQuery('knowledge', translatedVersionsGr.getUniqueValue());
            delContentGr.addQuery('topic', contentGr.getValue('topic'));
            delContentGr.query();
            while (delContentGr.next()) {
                delContentGr.deleteRecord();
                gs.addInfoMessage(gs.getMessage("A translated version of the deleted Knowledge article was automatically removed"));
            }
        }
    },
    addNewKBToTopic: function(kbGr) {
        var translatedVersionsGr = this.getTranslatedVersionsFromGr(kbGr, null);
        var translatedVersionsArr = [];
        if (kbGr.operation() == 'insert') {
            while (translatedVersionsGr.next()) {
                translatedVersionsArr.push(translatedVersionsGr.getUniqueValue());
            }
            var contentGr = new GlideAggregate(this.CONTENT_TABLE);
            contentGr.addQuery('knowledge', 'IN', translatedVersionsArr);
            contentGr.groupBy('topic');
            contentGr.groupBy('content_type');
            contentGr.groupBy('source');
            contentGr.query();
            while (contentGr.next()) {
                this._insertConnectedContent(contentGr, kbGr.getUniqueValue());
            }
        } else {
            translatedVersionsArr.push(kbGr.getUniqueValue());
            while (translatedVersionsGr.next()) {
                translatedVersionsArr.push(translatedVersionsGr.getUniqueValue());
            }
            var contentGr = new GlideAggregate(this.CONTENT_TABLE);
            contentGr.addQuery('knowledge', 'IN', translatedVersionsArr);
            contentGr.groupBy('topic');
            contentGr.groupBy('content_type');
            contentGr.groupBy('source');
            contentGr.query();
            while (contentGr.next()) {
                translatedVersionsArr.forEach(function(kbSysId) {
                    this._insertConnectedContent(contentGr, kbSysId);
                }, this);
            }
        }
    },

    /**
     * returns encoded query for getting translated version of given article .
     * 
     * @param GlideRecord: kb_knowledge record.
     * 
     * Replica of new global.KBTranslation().getTranslatedVersionEncodedQuery(kbGr) to support Rome
     */

    getTranslatedVersionEncodedQuery: function(articleGr) {
        var kbArticleGr = new GlideRecord('kb_knowledge');

        if (GlidePluginManager.isActive('com.snc.knowledge_advanced') && !articleGr.summary.nil()) {
            //Versioning is installed and this article is versioned.
            if (gs.nil(articleGr.parent)) {
                kbArticleGr.addQuery('parent', articleGr.sys_id)
                    .addOrCondition('parent.summary', articleGr.summary);
            } else {
                kbArticleGr.addQuery('summary', '!=', articleGr.summary);
                //Bypass Before query BRs for dotwalking.
                var temp = new GlideRecord('kb_knowledge');
                //temp.setWorkflow(false);
                temp.get(articleGr.parent);
                kbArticleGr.addQuery('parent', articleGr.parent).addOrCondition('parent.summary', articleGr.summary).addOrCondition('summary', temp.summary);
            }
        } else {
            if (gs.nil(articleGr.parent))
                kbArticleGr.addQuery('parent', articleGr.sys_id);
            else {
                kbArticleGr.addQuery('sys_id', '!=', articleGr.sys_id);
                kbArticleGr.addQuery('parent', articleGr.parent).addOrCondition('sys_id', articleGr.parent);
            }
        }
        return kbArticleGr.getEncodedQuery() + '';
    },
    translatedVersionDoesntExist: function(contentGr) {
        var translatedVersionsGr = this.getTranslatedVersionsFromSysId(contentGr.getValue('knowledge'));
        while (translatedVersionsGr.next()) {
            var newContentGr = new GlideRecord(this.CONTENT_TABLE);
            newContentGr.addQuery('knowledge', translatedVersionsGr.getUniqueValue());
            newContentGr.addQuery('topic', contentGr.getValue('topic'));
            newContentGr.query();
            if (newContentGr.next()) {
                return false;
            }
        }
        return true;
    },

    linkNewKBToTopic: function(current, previous) {
        if (this.hasExistingKBarticleWithSameNumber(current)) {
            return;
        }
        var mapOnlyPublishedArticlesToTopics = gs.nil(gs.getProperty('assign_topics_for_pre_published_articles'))
        ? true 
        : gs.getProperty('assign_topics_for_pre_published_articles') === 'false';

        if (mapOnlyPublishedArticlesToTopics) {
            if (current.operation() != 'insert' && 
                ((!gs.nil(current.published) && gs.nil(previous.published)) || 
				(current.parent !== previous.parent))) {
                    // Link new translated version to topic
                    this.addNewKBToTopic(current);
            } else if (current.operation() == 'insert' && 
                   (current.workflow_state == 'published' || !gs.nil(current.published))) {
                        this.addNewKBToTopic(current);
            }
        } else if (current.operation() == 'insert') {
            this.addNewKBToTopic(current);
        }
    },
    type: 'KBContentTranslationUtilSNC'
};
