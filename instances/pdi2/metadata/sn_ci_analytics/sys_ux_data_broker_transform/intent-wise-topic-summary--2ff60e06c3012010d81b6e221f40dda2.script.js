function transform(input) {
    var populate = function(output, key, itemList) {
        output[key] = {
            items: itemList
        };
    };
    var requestBody = {
        from_date: input.from_date,
        to_date: input.to_date,
        platform: 'chat',
        event_type_filter: 'Intent'
    };
    var output = {};
    var vaUtils = new sn_ci_analytics.VADashboardUtils();
    if (!vaUtils.isValidDate(input.from_date) || !vaUtils.isValidDate(input.to_date)) {
        return output;
    }
    var response = AnalyticsServiceInvoker.invoke("Event", "getAnalyticsEventPropertyValues", requestBody);

    var responseBody = response && response['Intent'];
    for (var key in responseBody) {
        var topics = responseBody[key];
        var list = [];
        var topicNamesToOccurrences = topics && topics['Topic Name'];
        for (var topic in topicNamesToOccurrences) {
            list.push({
                topic: topic,
                count: topicNamesToOccurrences[topic]
            });
        }
        list.sort(function(a, b) {
            return b.count - a.count;
        });
        list.splice(input.topic_count);
        var outList = [];
        for (var item in list) {
            outList.push({
                template: 'now-stylized-text',
                propValues: {
                    tag: 'span',
                    text: list[item].topic,
                    css: '* {font-size: 12px}'
                },
            });
        }
        if (key.includes('Incorrectly')) {
            populate(output, 'Incorrect', outList);
        } else if (key.includes('Correctly')) {
            populate(output, 'Correct', outList);
        } else if (key.includes('Auto Selected')) {
            populate(output, 'AutoSelected', outList);
        }
    }
    return output;
}
