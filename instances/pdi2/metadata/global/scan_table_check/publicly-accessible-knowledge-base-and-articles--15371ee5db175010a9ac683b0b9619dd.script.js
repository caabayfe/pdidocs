(function(finding, current) {

    var guestUC = [];
    var publicKBList = [];
    var publicKBs = [];

    var user = gs.getSession().impersonate(current);
    kbGr = new SNC.KnowledgeHelper().getReadableKnowledgeBases();
    while (kbGr.next()) {
        publicKBList.push(kbGr.getUniqueValue());
        publicKBs.push(kbGr.getValue('title'));
        var gr_KB = new GlideRecord('kb_knowledge_base');
        gr_KB.get('sys_id', kbGr.getUniqueValue());
        finding.setCurrentSource(gr_KB);
        finding.increment();
    }
    kbCount = publicKBList.length;
    guestUC = new SNC.KnowledgeHelper().getAllMatchingKnowledgeCriteria(current).split(',');
    gs.getSession().impersonate(user);
    articleTotalCount(publicKBList, guestUC);

    function articleTotalCount(publicKBList, guestUC) {
        var articles = new GlideRecord('kb_knowledge');
        articles.addQuery('kb_knowledge_base', 'IN', publicKBList);
        articles.addEncodedQuery(guestUC.reduce(function(query, uc) {
            return query + '^ORcan_read_user_criteriaLIKE' + uc;
        }, 'can_read_user_criteriaISEMPTY'));
        articles.addEncodedQuery(guestUC.reduce(function(query, uc) {
            return query + '^ORcannot_read_user_criteriaNOT LIKE' + uc;
        }, 'cannot_read_user_criteriaISEMPTY'));
        articles.setWorkflow(false);
        articles.query();
        while (articles.next()) {
            finding.setCurrentSource(articles);
            finding.increment();

        }

    }


})(finding, current);
