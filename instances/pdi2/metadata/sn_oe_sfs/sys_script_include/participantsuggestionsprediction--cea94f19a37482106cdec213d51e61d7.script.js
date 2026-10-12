var ParticipantSuggestionsPrediction = Class.create();
ParticipantSuggestionsPrediction.prototype = {
    initialize: function() {
    },
	execute: function(inputs) {
		var results = new sn_oe_sfs.SidebarParticipantSuggestionsUtils().getParticipantSuggestions(inputs.document_table, inputs.document_id, inputs.path, inputs.participant_count);
		var outputJson = {'result' : results};
        return outputJson;
	},
    type: 'ParticipantSuggestionsPrediction'
};
