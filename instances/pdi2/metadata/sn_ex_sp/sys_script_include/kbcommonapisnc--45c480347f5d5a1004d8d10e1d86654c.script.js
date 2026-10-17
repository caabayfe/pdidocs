var KBCommonAPISNC = Class.create();
KBCommonAPISNC.prototype = {
    initialize: function() {
        this.KB_BLOCK_ACTIVE = new GlidePluginManager().isActive('com.snc.knowledge_blocks');
    },

    /**
     * API abstracts all KB specific logic for fetching content 
     * @param {GlideRecord} GlideRecord of knowledge article 
     * @returns {String} content of the article
     */
    getKBContent: function(kbGr) {
        var description = "";
        if (!kbGr || !kbGr.isValidRecord()) {
            return description;
        }
        var kbClassName = kbGr.getRecordClassName();
        if (kbClassName.includes("kb_template_")) {
            var articleContent = new global.ArticleTemplateUtil().getArticleContentData(kbClassName, kbGr.getUniqueValue()) || [];
            for (var i = 0; i < articleContent.length && !description; i++) {
                if (articleContent[i].content)
                    description = articleContent[i].content;
            }
        } else if (this.KB_BLOCK_ACTIVE) {
            description = new global.KBBlock().getArticleContent(kbGr, gs.getUserID());
        } else {
            var displayText = kbGr.getDisplayValue('text');
            description = displayText ? displayText.split(" ", 300).join(" ") : displayText;
        }
        return description;
    },

    type: 'KBCommonAPISNC'
};
