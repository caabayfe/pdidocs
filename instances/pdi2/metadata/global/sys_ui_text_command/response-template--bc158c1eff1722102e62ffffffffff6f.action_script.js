function getResponseTemplates(recordTable, recordSysId, query) {
	if (query == "") {
		answer = {
			message: gs.getMessage('Enter a keyword to search for the relevant template')
		};
	}
	else {
		var template = new sn_templated_snippets.ResponseTemplate();
		var limit = gs.getProperty('com.glide.quickactions.maxresults.templates', 9);
		var offset = 0;
		var includeEvaluatedBody = true;
		var errorFormat = "";
		var chatResponseTemplateChannel = 'form';
		template.setChannel(chatResponseTemplateChannel);

		var raw = template.query(recordTable, recordSysId, query, limit, offset, includeEvaluatedBody, errorFormat);
		var queryResult = JSON.parse(raw);
		var items = queryResult.filter(function(result) {
			return result.evaluated_response.success;
		}).map(function(result) {
			return {
				id: result.sys_id,
				displayContent: result.evaluated_response.evaluated_body,
				title: result.name,
				insertContent: result.evaluated_response.evaluated_body
			};
		});
		if (!items.length) {
			answer = {
				templateMessage: {
					illustration: "no-search-results",
					headingLabel: gs.getMessage('Template not found'),
					content: gs.getMessage('Try searching with another keyword')
				}
			};
		} else {
				answer = {
				items: items,
			};
		}
	}
	return answer;

}

answer = getResponseTemplates(recordTable, recordSysId, query);
