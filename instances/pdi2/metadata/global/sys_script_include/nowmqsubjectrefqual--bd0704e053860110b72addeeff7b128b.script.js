var NowMQSubjectRefQual = Class.create();
NowMQSubjectRefQual.prototype = {
    initialize: function() {
    },
	
	getFilter: function(current) {
		var notSysIds = [];		
		var gr = new GlideRecord(current.getTableName());
		gr.addQuery("root_token", current.root_token);
		gr.addQuery("subject_name", "STARTSWITH", current.subject_name);
		gr.query();
		while(gr.next())
			notSysIds.push(gr.getUniqueValue());
		
		return "sys_idNOT IN" + notSysIds;
		
	},

    type: 'NowMQSubjectRefQual'
};
