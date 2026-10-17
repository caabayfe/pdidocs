(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    var reportId = request.pathParams.report_id;
    var language = request.pathParams.language || 'en';
    gs.debug('[DISC] Utterances API: Called with reportId=' + reportId);

	var taxonomyUtil = new sn_nlu_discovery.TaxonomyUtil();

    var intent = new GlideRecord('sn_nlu_discovery_intent');
    intent.addQuery('report', reportId);
    intent.query();

    var utterances = {};
	var intents = taxonomyUtil.getTaxonomyIntents(reportId, language);
    
    while (intent.next()) {
		var intentName = taxonomyUtil.getTaxonomyNameFromIntentName(intent.getValue('name'));
		var matchingIntent = intents.filter( function(tempIntent) {
			return tempIntent.name === intentName;
		});
		if (matchingIntent.length === 0) {
			utterances[intent.getValue('sys_id')]  = [];
		} else {
			utterances[intent.getValue('sys_id')] = ((matchingIntent[0] || {}).samples || []).map(function(sample) {
				return sample["utterance"];
			});
		}
        gs.debug('[DISC] Utterances API: Found ' + utterances[intent.getValue('sys_id')].length + ' utterances for ' + language + ' intent ' + intentName);
    }
    return utterances;
})(request, response);
