function transform(input) {
    if (gs.nil(input.eventId))
        return [];

    var indicatorId = "ad33bcf17785021030f71f130e5a998e";
    var eventBreakdown = "7ba468717745021030f71f130e5a991a";
    var eventPropBreakdown = "1907a4357745021030f71f130e5a996e";
	var customEventBreakdown = "67fa28797745021030f71f130e5a995e";
    var eventBreakdownElement = input.eventId;

    var startDate = input.startDate;
    var endDate = input.endDate;

    function getEventProps(eventId) {
        var gr = new GlideRecord('sn_ci_analytics_event_prop');
        gr.addQuery('event', eventId);
        gr.query();
        var eventProps = [];
        while (gr.next()) {
            eventProps.push({
                name: gr.getValue('name'),
                id: gr.sys_id + ''
            });
        }
        return eventProps;
    }

    function fetchPAScores(uuid, startDate, endDate) {
        var sc = new PAScorecard();
        sc.addParam('uuid', uuid);
        sc.addParam('from', startDate);
        sc.addParam('to', endDate);
        sc.addParam('include_scores', true);
        return sc.query();
    }

    function getSumOfScores(scores) {
        var score = 0;
        scores.forEach(function(obj) {
            score += obj.value ? obj.value : 0;
        });
        return score;
    }



    function getPAScore(uuid) {
        var scoreCard = fetchPAScores(uuid, startDate, endDate);
        var score = (scoreCard && scoreCard[0]) ? getSumOfScores(scoreCard[0].scores) : 0;
        var label = (scoreCard && scoreCard[0]) ? scoreCard[0].element_level2.display_value : '';
        return {
            value: score,
            label: label
        };
    }

    function getCustomEventsBreakdowns(eventPropId) {
        var gr = new GlideRecord('sn_ci_analytics_event_breakdown');
        gr.addQuery('event_prop', eventPropId);
        gr.query();
        var eventPropBreakdowns = [];
        while (gr.next()) {
            eventPropBreakdowns.push({
                name: gr.getValue('name'),
                id: gr.sys_id + ''
            });
        }
        return eventPropBreakdowns;
    }

    function fetchEventPropScore(eventProp) {
        var propScores = [];
        var customBreakdowns = getCustomEventsBreakdowns(eventProp.id);
        customBreakdowns.forEach(function(customBreakdown) {
            var uuid = indicatorId + ":" + eventPropBreakdown + ":" + eventProp.id + ":" + customEventBreakdown + ":" + customBreakdown.id;
			propScores.push(getPAScore(uuid));
        });
		return propScores;
    }

    var eventProps = getEventProps(input.eventId);
    var result = [];

    eventProps.forEach(function(eventProp) {
        var scores = fetchEventPropScore(eventProp);
        result.push({
			name: eventProp.name,
			scores: scores
		});
    });

    return result;
}
