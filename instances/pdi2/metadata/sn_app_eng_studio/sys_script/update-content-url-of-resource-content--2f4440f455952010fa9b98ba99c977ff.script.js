(function executeRule(current, previous /*null when async*/ ) {
    var contextDocUrlPath = '/api/now/v1/context_doc_url/';

    current.content_url = contextDocUrlPath + current.content_url;
})(current, previous);
