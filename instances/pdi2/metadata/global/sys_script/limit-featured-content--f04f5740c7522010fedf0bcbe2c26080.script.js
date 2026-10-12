(function executeRule(current, previous /*null when async*/ ) {
    //This BR is used to limit the number of Featured Content that can be linked to a Taxonomy Topic
    var limit = GlideApplicationProperty.getValue('taxonomy.content.featured_content_limit');
    var count = new GlideAggregate('featured_content');
    count.addQuery('topic', current.topic);
    count.addAggregate('COUNT');
    count.query();
    var content = 0;
    if (count.next())
        content = count.getAggregate('COUNT');
    if (content > (limit - 1)) {
        current.setAbortAction(true);
        gs.addErrorMessage(gs.getMessage("Only {0} featured content per topic are allowed", limit));
    }

})(current, previous);
