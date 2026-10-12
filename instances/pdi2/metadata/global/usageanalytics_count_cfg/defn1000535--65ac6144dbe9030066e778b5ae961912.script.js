var stateToReco = {count: 0};
var activity = new GlideRecord('sn_bm_client_recommendation_activity');
activity.addEncodedQuery('action_dateISNOTEMPTY^ORimplementation_dateISNOTEMPTY');
activity.query();
while(activity.next()) {
    var state = activity.state + '';
    var reco  = activity.recommendation.number + '';
    if(!(state in stateToReco))
        stateToReco[state] = {count: 0, recommendations: []};
    stateToReco[state]['count']++;
    if(state == 'implemented')
        stateToReco[state]['recommendations'].push({'number': reco, 'implementation_date': activity.implementation_date + ''});
    else
        stateToReco[state]['recommendations'].push({'number': reco, 'action_date': activity.action_date + ''});
    stateToReco['count']++;
}
answer = new JSON().encode(stateToReco);
