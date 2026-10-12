var TopicTemplateUtilSNC = Class.create();
    TopicTemplateUtilSNC.prototype = Object.extendsObject(global.AbstractAjaxProcessor, {
    /** Returns true if template field exists */
    templateFieldExists: function () {
        var templateExists = false;
        var taxonomyGr = new GlideRecord('taxonomy');
        taxonomyGr.addActiveQuery();
        taxonomyGr.query();
        if (!taxonomyGr.hasNext()) {
            return false;
        }
        while (taxonomyGr.next()) {
            var taxonomy = new sn_taxonomy.Taxonomy(taxonomyGr.getUniqueValue());
            var topics = taxonomy.getTopics(false, 1, false);

            if (topics.length > 0) {
                templateExists = Object.keys(topics[0]).indexOf('template') !== -1 ? true : false;
                if (templateExists) {
                    break;
                }
            }
        }
        return templateExists;
    },
    getApproriateTemplate: function () {
        var topicSysId = this.getParameter("sysparm_topic_sys_id");
        var topicGr = new GlideRecord('topic');
        if(topicGr.get(topicSysId) && topicGr.getValue('apply_to_child_topics') == true){
            return topicGr.getValue('template');
        }
        return null;
    },
    showAlertOnSelectingKB: function(){
        var kbSysId = this.getParameter("sysparm_kb_sys_id");
        var kbs = new KBContentTranslationUtilSNC().getTranslatedVersionsFromSysId(kbSysId);
        if(kbs.hasNext()){
            return true;
        }
        return false;
    },
    type: 'TopicTemplateUtilSNC'
});
