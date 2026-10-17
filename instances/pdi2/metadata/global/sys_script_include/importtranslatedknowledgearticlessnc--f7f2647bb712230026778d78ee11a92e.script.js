var ImportTranslatedKnowledgeArticlesSNC = Class.create();
ImportTranslatedKnowledgeArticlesSNC.prototype = {
    initialize: function() {},

    copyAttachment: function(oldKbId, newKbId) {
        var gsa = new GlideSysAttachment();
        gsa.copy('kb_knowledge', oldKbId, 'kb_knowledge', newKbId);
    },

    assignField: function(newGr, newField, oldGr, field) {
        if (!newGr.isValidField(newField) || !oldGr.isValidField(field))
            return;
        newGr[newField] = oldGr[field];
    },

    importTranslated: function(kbGr, title, text, lang) {
        if (!text)
            return null;
        var newKbGr = new GlideRecord('kb_knowledge');
        newKbGr.initialize();
        newKbGr.language = lang;

        this.assignField(newKbGr, 'parent', kbGr, 'sys_id');
        this.assignField(newKbGr, 'topic', kbGr, 'topic');
        this.assignField(newKbGr, 'category', kbGr, 'category');
        newKbGr.workflow_state = 'draft';
        this.assignField(newKbGr, 'article_type', kbGr, 'article_type');
        this.assignField(newKbGr, 'roles', kbGr, 'roles');
        if (title)
            newKbGr.short_description = title;
        else
            this.assignField(newKbGr, 'short_description', kbGr, 'short_description');
        newKbGr.text = text;
        this.assignField(newKbGr, 'meta', kbGr, 'meta');
        this.assignField(newKbGr, 'source', kbGr, 'source');
        this.assignField(newKbGr, 'flagged', kbGr, 'flagged');
        this.assignField(newKbGr, 'author', kbGr, 'author');
        this.assignField(newKbGr, 'use_count', kbGr, 'use_count');
        this.assignField(newKbGr, 'rating', kbGr, 'rating');
        this.assignField(newKbGr, 'description', kbGr, 'description');
        this.assignField(newKbGr, 'kb_knowledge_base', kbGr, 'kb_knowledge_base');
        this.assignField(newKbGr, 'kb_category', kbGr, 'kb_category');
        this.assignField(newKbGr, 'retired', kbGr, 'retired');
        this.assignField(newKbGr, 'disable_commenting', kbGr, 'disable_commenting');
        this.assignField(newKbGr, 'disable_suggesting', kbGr, 'disable_suggesting');
        return newKbGr.insert();
    },

    searchTranslated: function(kbGr) {
        var titleGr = new GlideRecord('sys_translated');
        var textGr = new GlideRecord('sys_translated_text');
        var languages = {};
        textGr.addQuery('tablename', 'kb_knowledge');
        textGr.addQuery('documentkey', kbGr.sys_id);
        textGr.addQuery('fieldname', 'text');
        textGr.query();
        //Return early if translation is not present to improve performance
        if (!textGr.hasNext())
            return;
        titleGr.addQuery('name', 'kb_knowledge');
        titleGr.addQuery('element', 'short_description');
        titleGr.addQuery('value', kbGr.short_description);
        titleGr.query();

        while (titleGr.next()) {
            var lang = titleGr.language + '';
            if (!languages[lang])
                languages[lang] = {
                    title: null,
                    text: null
                };
            languages[lang].title = titleGr.label;
        }
        while (textGr.next()) {
            var lang = textGr.language + '';
            if (!languages[lang])
                languages[lang] = {
                    title: null,
                    text: null
                };
            languages[lang].text = textGr.value;
        }
        for (var lang in languages) {
            if (languages.hasOwnProperty(lang)) {
                if (!this.checkLocalizedArticleExists(lang, kbGr)) {
                    var newKbId = this.importTranslated(kbGr, languages[lang].title, languages[lang].text, lang);
                    if (newKbId) {
                        new GlideTSUtil().indexDocument('kb_knowledge', newKbId + "")
                        this.copyAttachment(kbGr.sys_id, newKbId);
                        gs.log("Imported article: '" + kbGr.short_description + "' for language: '" + lang + "' in Draft State.");
                    }


                } else {
                    gs.log("Skipped Import for article: '" + kbGr.short_description + "' in language: '" + lang + "'");
                }
            }
        }
    },

    checkLocalizedArticleExists: function(language, articleRecord) {
        var articleAgg = new GlideAggregate('kb_knowledge');
        articleAgg.addQuery("language", language);
        articleAgg.addQuery("parent", articleRecord.getUniqueValue());
        articleAgg.addAggregate("COUNT");
        articleAgg.query();
        var count = 0;
        if (articleAgg.next()) {
            count = articleAgg.getAggregate('COUNT');
        }
        return (count > 0) ? true : false;
    },

    importArticles: function() {
        var gr = new GlideRecord('kb_knowledge');
        gr.addActiveQuery();
        //Create translations of only latest draft/published articles
        gr.addQuery('workflow_state', 'IN', 'draft,published');
        gr.query();
        while (gr.next())
            this.searchTranslated(gr);
    },

    type: 'ImportTranslatedKnowledgeArticlesSNC'
};
