(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    var data = request.body.data;
    var intentName = request.body.data.intent;
    var intentId = request.body.data.intentId;
    var language = request.body.data.language;
    var modelId = request.body.data.model;
    gs.debug('[DISC] addutterances: Called with intentId = ' + intentId);

    var intentGr = new GlideRecord('sys_nlu_intent');
    if (intentId && intentId != null) {
        intentGr.get(intentId);
    }

    var modelGr = new GlideRecord('sys_nlu_model');
    modelGr.get(modelId);
    if (modelGr.getRowCount() == 0) {
        gs.warn('[DISC] Model not found with model id = ' + modelGr.getUniqueValue());
        response.setBody({
            status: 'failure',
            field: 'model',
            msg: 'Invalid model id ' + modelId
        });
        return;
    }

    // If intent does not exist create in the model provided in the request.
    if (intentGr.getRowCount() == 0) {
        gs.debug('[DISC] Intent not found with intentId = ' + intentId);
        intentGr = new GlideRecord('sys_nlu_intent');
        intentGr.initialize();
        intentGr.model = modelId;
        intentGr.name = intentName;
        // update intentSys id for tracking record
        intentId = intentGr.insert();
        if (intentId) {
            gs.debug('[DISC] Added intent to model with model id = ' + modelGr.getUniqueValue());
        } else {
            response.setBody({
                status: 'failure',
                field: 'intent',
                msg: 'Invalid intent id ' + intentId
            });
            return;
        }
    }

    if (modelGr.getValue('language') !== language) {
        var query = 'sys_id=' + modelId + '^ORprimary_model.sys_id=' + modelId + '^language=' + language;
        if (language == 'en') query += '^ORlanguageISEMPTY';
        modelGr = new GlideRecord('sys_nlu_model');
        modelGr.addEncodedQuery(query, true);
        modelGr.query();
        if (modelGr.next()) {
            intentGr = new GlideRecord('sys_nlu_intent');
            intentGr.addQuery('model', modelGr.getUniqueValue());
            intentGr.addQuery('name', intentName);
            intentGr.query();
            intentId = intentGr.next() ? intentGr.getUniqueValue() : '';
        }
    }

    var utterances = [];
    if (data.utterances && data.utterances !== "") {
        gs.debug('[DISC] Utterances found = ' + data.utterances);
        utterances = (data.utterances).split(",");
    } else {
        gs.warn('[DISC] No utterances found');
        response.setBody({
            status: 'failure',
            field: 'utterances',
            msg: 'No utterances were passed'
        });
        return;
    }

    // Keep track of existing utterances, and skip them on adding.
    var existingUtterances = {};
    var gr = new GlideRecord('sys_nlu_utterance');
    gr.addQuery('intent', intentGr.getUniqueValue());
    gr.addEncodedQuery('utteranceIN' + utterances.join(','), true);
    gr.query();
    if (gr.getRowCount() > 0) {
        while (gr.next()) {
            existingUtterances[gr.getValue('utterance').toLowerCase()] = true;
        }
        gs.debug('[DISC] Duplicate utterances found = ' + Object.keys(existingUtterances));
    }

    // Add utterance and skip the one already present
    for (var i = 0; i < utterances.length; i++) {
        if (existingUtterances[(utterances[i] || '').toLowerCase()]) {
            continue;
        }
        var utt = new GlideRecord('sys_nlu_utterance');
        utt.initialize();
        utt.intent = intentGr.getUniqueValue();
        utt.utterance = utterances[i];
        utt.insert();
    }

    if (((request.body.data || {}).source || {}).cluster) {
        var trackUtil = new sn_nlu_discovery.IntentDiscoveryRecordTracking();
        var trackedRecord = trackUtil.trackClusterAction(request.body.data.source.cluster, null, intentId);
        if (trackedRecord === null) {
            gs.error("Unable to create tracking reacord for utterances added from cluster: intentID:" + intentId);
        }
    }

    // Return data for added, skipped info
    if (Object.keys(existingUtterances).length > 0) {
        // track added records
        var resp = {
            status: 'success',
            msg: 'Duplicate utterances found',
            added: utterances.length - Object.keys(existingUtterances).length,
            skipped: Object.keys(existingUtterances).length,
            duplicateUtterances: Object.keys(existingUtterances)
        };
        gs.debug('[DISC] Added ' + resp.added + ' utterances and skipped ' + resp.skipped + ' utterances');
        response.setBody(resp);
    } else {
        gs.debug('[DISC] Added all utterances');
        response.setBody({
            status: 'success',
            msg: 'Added all utterances'
        });
    }

})(request, response);
