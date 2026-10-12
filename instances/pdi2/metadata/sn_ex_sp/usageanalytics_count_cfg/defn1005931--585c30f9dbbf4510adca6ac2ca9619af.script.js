/**
 * Function to get url of every topic page.
 */
 function getTopicPageUrls() {
    var topicPageUrls = {"4fb26c9cc3d030102ec1a589a840ddbd": true};

    var dictionaryGr = new GlideRecord("sys_dictionary");
    dictionaryGr.addQuery("name", "topic");
    dictionaryGr.addQuery("element", "template");
    dictionaryGr.query();

    if (dictionaryGr.getRowCount() > 0) {
        var gr = new GlideRecord("topic");
        gr.addNotNullQuery("template");
        gr.query();
        while (gr.next())
            topicPageUrls[gr.template.toString()] = true;
    }
    return topicPageUrls;
}

var gr = new GlideAggregate("sp_log");
gr.addQuery('sys_created_onONLast month@javascript:gs.beginningOfLastMonth()@javascript:gs.endOfLastMonth()');
gr.addQuery("page", "IN", Object.keys(getTopicPageUrls()));
gr.setGroup(false);
gr.addAggregate('COUNT(DISTINCT', 'user');
gr.query();
gr.next();
answer = gr.getAggregate('COUNT(DISTINCT','user');
