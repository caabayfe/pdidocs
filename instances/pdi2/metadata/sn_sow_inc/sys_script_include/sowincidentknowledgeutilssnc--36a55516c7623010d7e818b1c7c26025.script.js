var SOWIncidentKnowledgeUtilsSNC = Class.create();
SOWIncidentKnowledgeUtilsSNC.prototype = {
    initialize: function() {},

    canCreateKnowledgeArticle: function(incidentGr) {
        var enableKBCreateStates = this.getCreateKBMultiStatesFromProperty();
        if (!gs.nil(enableKBCreateStates) && enableKBCreateStates.indexOf(incidentGr.state) != -1) {
            var knowledgeGr = new GlideRecord('kb_knowledge');
            knowledgeGr.addQuery('source', incidentGr.getUniqueValue());
            knowledgeGr.setLimit(1);
            knowledgeGr.query();
            if (!knowledgeGr.hasNext()) {
                var kbKnowledge = new global.KBKnowledge();
                if (GlidePluginManager.isActive('com.snc.incident.knowledge')) {
                    return kbKnowledge.canCreate();
                } else if (gs.getProperty('glide.knowman.submission.workflow') != 'true') {
                    var kBaseGr = new GlideRecord('kb_knowledge_base');
                    if (kBaseGr.get(gs.getProperty("glide.knowman.task_kb", "dfc19531bf2021003f07e2c1ac0739ab"))) {
                        var knowledgeAccess = new global.KnowledgeAccess();
                        return knowledgeAccess.contributorRight(kBaseGr);
                    }
                } else {
                    return true;
                }
            }
        }
        return false;
    },

    canEditKnowledgeArticle: function(incidentGr) {
        var result = false;
        var enableKBCreateStates = this.getCreateKBMultiStatesFromProperty();
        if (!gs.nil(enableKBCreateStates) && enableKBCreateStates.indexOf(incidentGr.state) != -1) {
            result = this.getEditKnowledgeDetails(incidentGr).canEditKnowledge;
        }
        return result;
    },

    getEditKnowledgeArticleLink: function(incidentGr) {
        var result = this.getEditKnowledgeDetails(incidentGr);
        if (!gs.nil(result.sysId)) {
            var knowledgeSysId = result.sysId;
            return 'kb_knowledge.do?sys_id=' + encodeURIComponent(knowledgeSysId) + '&sysparm_referring_url=kb_view.do';
        } else return null;
    },

    getEditKnowledgeDetails: function(incidentGr) {
        var canEditKnowledge = false;
        var sysId = '';
        var canWriteCount = 0;

        var knowledgeGr = new GlideRecordSecure('kb_knowledge');
        knowledgeGr.addQuery('source', incidentGr.getUniqueValue());
        knowledgeGr.query();

        while (knowledgeGr.next()) {
            if (knowledgeGr.canWrite()) {
                canWriteCount++;
                sysId = knowledgeGr.getValue('sys_id');

                // If more than one writable record, stop and reset
                if (canWriteCount > 1) {
                    sysId = '';
                    break;
                }
            }
        }

        // Set result to true only if exactly one record is writable
        if (canWriteCount === 1) {
            canEditKnowledge = true;
        } else {
            canEditKnowledge = false;
            sysId = '';
        }

        var editKnowledgeDetails = {
            canEditKnowledge: canEditKnowledge,
            sysId: sysId
        };

        return editKnowledgeDetails;
    },

    getCreateKBMultiStatesFromProperty: function() {
        return gs.getProperty("com.snc.incident.create_knowledge.multistate.enable", "6,7");
    },

    getNewKnowledgeArticleLink: function(incidentGr) {
        var map = new global.CSMTableMapUtil(incidentGr);
        map.findMapByName("incident_kcs_article_html");
        var targetURL = map.getTargetURL();
        if (targetURL)
            return targetURL[0];
        else
            return null;
    },

    type: 'SOWIncidentKnowledgeUtilsSNC'
};
