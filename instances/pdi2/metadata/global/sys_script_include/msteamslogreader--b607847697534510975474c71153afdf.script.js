var MSTeamsLogReader = Class.create();
MSTeamsLogReader.prototype = {

	initialize: function() {
	},

	read: function(encodedQuery, limit, orderBy, tableName) {
		var results = [];

		if (gs.nil(tableName))
			return results;

		var gr = new GlideRecord(tableName);
		gr.addEncodedQuery(encodedQuery || '');
		gr.orderByDesc(orderBy || '');
		gr.setLimit(limit || 0);
		gr.query();

		while (gr.next()) {
			results.push({
				source: gr.getValue("source"),
				message: gr.getValue("message"),
				level: gr.getValue("level"),
				sys_id: gr.getValue("sys_id"),
				created_on: gr.getValue("sys_created_on"),
				response_time: gr.getValue("response_time"),
				oauth_oidc_entity: gr.getValue("oauth_oidc_entity"),
			});
		}
		return results;
	},

	type: 'MSTeamsLogReader'
};
