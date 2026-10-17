insertPrevDayECCTopics();

function insertPrevDayECCTopics() {
    var encodedQuery = getEncodedQuery();
    var eccRecord = new GlideAggregate('ecc_queue');
    eccRecord.addAggregate('COUNT', 'topic');
    eccRecord.addEncodedQuery(encodedQuery);
    eccRecord.query();

    var usageAnalyticsRec = new GlideRecord('ecc_queue_usage_analytics');
    usageAnalyticsRec.initialize();
    var aggregatedOn = getYesterdayDate();
    while (eccRecord.next()) {
        usageAnalyticsRec.topic = eccRecord.topic;
        usageAnalyticsRec.count = eccRecord.getAggregate('COUNT', 'topic');
        usageAnalyticsRec.aggregated_on = aggregatedOn;
        usageAnalyticsRec.insert();
    }
}

function getEncodedQuery() {
    var topicFilters = ['queue.stats', 'HeartbeatProbe', 'queue.processing', 'SystemCommand'];
    var previousDayFilter = 'sys_created_onONYesterday@javascript:gs.beginningOfYesterday()@javascript:gs.endOfYesterday()';

    var encodedQuery = 'topic!=' + topicFilters[0] + '^ORtopic=NULL';
    for (var i = 1; i < topicFilters.length; i++) {
        encodedQuery = encodedQuery + '^' + 'topic!=' + topicFilters[i] + '^ORtopic=NULL';
    }
    encodedQuery = encodedQuery + '^' + previousDayFilter;
    return encodedQuery;
}

function getYesterdayDate() {
    var dateTime = gs.daysAgoStart(1);
    var gdt = new GlideDateTime(dateTime);
    return gdt.getDate();
}
