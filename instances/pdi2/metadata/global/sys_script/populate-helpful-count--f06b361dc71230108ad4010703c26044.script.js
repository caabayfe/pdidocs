(function executeRule(current, previous /*null when async*/ ) {

	    var usefulCount = getUsefulCountFromFeedback(current);
	    new global.KBCommon().initializeHelpfulCount(current, previous,usefulCount);

    })(current, previous);

    function getUsefulCountFromFeedback(current) {
        var articleId = current.article;
        var count = 0;
    
        //setting the value based on no of feedback records
        var ga = new GlideAggregate('kb_feedback');
        ga.addQuery('useful', 'yes');
        if (new KBCommon().isVersioningEnabled())
            ga.addQuery("article.article_id", current.article.article_id);
        else
            ga.addQuery('article', articleId);
      ga.addAggregate('COUNT');
        ga.query();
    
        if (ga.next())
            count = ga.getAggregate('COUNT');
    
        return count;
    }
