(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

	var data = {};
	var limit;
	if (!request.queryParams.hasOwnProperty('userId'))
        return new sn_ws_err.BadRequestError('Missing user id');
	
	if (!request.queryParams.hasOwnProperty('source'))
        return new sn_ws_err.BadRequestError('Missing nlq source');

	if (request.queryParams.hasOwnProperty('limit'))
		limit = request.queryParams['limit'];
	
	if (!limit || isNaN(limit)) {
		limit = 5;
	}
	
	var nlqQueryLogRecordGR = new GlideRecord('nlq_query_log');
	nlqQueryLogRecordGR.addQuery('user', request.queryParams['userId']);
	nlqQueryLogRecordGR.addQuery('source', request.queryParams['source']);
	nlqQueryLogRecordGR.addQuery('successful', true);
	nlqQueryLogRecordGR.orderByDesc('sys_created_on');
	nlqQueryLogRecordGR.query();
	
	while (nlqQueryLogRecordGR.next() && Object.keys(data).length < limit) {
		var utterance = nlqQueryLogRecordGR.getValue('utterance');
		if (!data[utterance] || data[utterance].length == 0) {
			var utteranceHasValidTables = true;
			// comma separated list of tables used in the utterance
			var tablesRaw = nlqQueryLogRecordGR.getValue('multi_table');
			var tablesArr = tablesRaw ? tablesRaw.split(',') : [];
			var tablesAndLabelArr = [];

			tablesArr.forEach(function(table) {
				var gr = new GlideRecord(table + '');
				var label = gr.getClassDisplayValue();
				// ensure the label is contained in the utterance.
				if (utterance.toLowerCase().indexOf(label.toLowerCase()) > -1) {
					tablesAndLabelArr.push({
						table: table,
						label: label,
					});
				} else {
					// the table might be a synonym so check those
					var grSynonyms = new GlideRecord('nlq_synonym');
					grSynonyms.addEncodedQuery('elementISEMPTY^table=' + table); // table synonyms have an empty element (column name) record
					grSynonyms.query();
					if (grSynonyms.next()) {
						var synonyms = grSynonyms.getValue('synonyms') ? grSynonyms.getValue('synonyms') : '';
						var synonymsArr = synonyms.split(',');
						var matchedPhrase = '';
						synonymsArr.forEach(function(synonym) {
							// find the synonym in the utterance
							if (utterance.toLowerCase().indexOf(synonym.toLowerCase()) > -1) {
								matchedPhrase = synonym.length > matchedPhrase.length ? synonym : matchedPhrase;
							}
						});
						// if matched phrase is still falsy then the link does not have valid tables
						if (!matchedPhrase) {
							utteranceHasValidTables = false;
						} else {
							tablesAndLabelArr.push({
								table: table,
								label: matchedPhrase,
							});
						}
					} else {
						// there was no synonym record
						utteranceHasValidTables = false;
					}
				}
			});
			data[utterance] = utteranceHasValidTables ? tablesAndLabelArr : [];
		}
	}
	response.setBody(data);
	response.setStatus(200);

})(request, response);
