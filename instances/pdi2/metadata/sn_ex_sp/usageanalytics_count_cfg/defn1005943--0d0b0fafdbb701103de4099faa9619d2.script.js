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

/**
 * Computes mean, median and max value for an array 
 */
function computeMean(values){
    if (!values.length)
        return 0;

    values.sort(function(a,b){
      return a-b;
    });
  
    var half = Math.floor(values.length / 2);
    
    if (values.length % 2)
        return values[half];
    else
        return (values[half - 1] + values[half]) / 2.0;
    
  }

var gr = new GlideAggregate("sp_log");
gr.addQuery('sys_created_onONLast month@javascript:gs.beginningOfLastMonth()@javascript:gs.endOfLastMonth()');
gr.addQuery("page", "IN", Object.keys(getTopicPageUrls()));
gr.addAggregate("COUNT");
gr.groupBy("session_id");
gr.query();

var topicCountsPerSession=[];
while (gr.next())
    try {
        topicCountsPerSession.push(parseInt(gr.getAggregate("COUNT")));
    }
    catch (err) {}

answer = computeMean(topicCountsPerSession);
