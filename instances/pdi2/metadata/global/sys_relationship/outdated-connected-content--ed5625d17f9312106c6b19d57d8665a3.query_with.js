(function refineQuery(current, parent) {

    var outdatedContentEncodedQuery = new TaxonomyUtilAjax().getOutdatedContentEncodedQuery();
    current.addEncodedQuery(outdatedContentEncodedQuery);
    current.addQuery('topic', parent.sys_id);

})(current, parent);
