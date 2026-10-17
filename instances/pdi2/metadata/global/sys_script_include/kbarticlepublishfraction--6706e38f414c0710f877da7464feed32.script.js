var KBArticlePublishFraction = Class.create();
KBArticlePublishFraction.prototype = {
    initialize: function() {
    },

	/**
     * Returns the fraction of articles published after being submitted for review
     * in the last 30 days.
     *
     * count1 = total pool: published OR review OR draft articles updated in last 30 days
     *          (with versioning filter when versioning is enabled)
     * count2 = articles in 'published' state only, updated in last 30 days
     *
     * @return {Number} count2/count1, or 0 if count1 is 0
     */
    getCount: function() {
        var gr = new GlideAggregate('kb_knowledge');
        gr.addAggregate('COUNT');
        if (new SNC.KnowledgeHelper().isVersioningEnabled())
            gr.addEncodedQuery('sys_class_name!=kb_knowledge_block^workflow_state=published^ORworkflow_state=review^sys_updated_onONLast 30 days@javascript:gs.beginningOfLast30Days()@javascript:gs.endOfLast30Days()^active=true^NQworkflow_state=draft^version.versionNOT LIKE.01^ORversion.versionNOT LIKE.02^sys_updated_onONLast 30 days@javascript:gs.beginningOfLast30Days()@javascript:gs.endOfLast30Days()^active=true');
        else
            gr.addEncodedQuery('sys_class_name!=kb_knowledge_block^workflow_state=published^ORworkflow_state=review^sys_updated_onONLast 30 days@javascript:gs.beginningOfLast30Days()@javascript:gs.endOfLast30Days()^active=true');
        gr.query();
        var count1;
        if (gr.next())
            count1 = gr.getAggregate('COUNT');
        else
            count1 = 0;

        gr = new GlideAggregate('kb_knowledge');
        gr.addAggregate('COUNT');
        gr.addEncodedQuery('sys_class_name!=kb_knowledge_block^workflow_state=published^sys_updated_onONLast 30 days@javascript:gs.beginningOfLast30Days()@javascript:gs.endOfLast30Days()^active=true');
        gr.query();
        var count2;
        if (gr.next())
            count2 = gr.getAggregate('COUNT');
        else
            count2 = 0;

        if (count1 === 0)
            return 0;
        return count2/count1;
    },

    type: 'KBArticlePublishFraction'
};
