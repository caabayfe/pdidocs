var LinkRecordProducerToIncident = Class.create();
LinkRecordProducerToIncident.prototype = {
	initialize: function() {
	},

	linkRecordProducerToParentIncident: function(parInc, gr) {
		if (GlideStringUtil.isEligibleSysID(parInc)) {
			var incGr = new GlideRecord("incident");
			if (incGr.get(parInc)) {
				if (gr.isValidField('parent')) {
					gr.parent = parInc;
					var incUrl = "<a href='" + incGr.getLink(true) + "'>" + incGr.getDisplayValue() + "</a>";
					var tableText = gr.getLabel();
					gs.addInfoMessage(gs.getMessage("{0} {1} is created from {2}", [tableText, gr.getDisplayValue(), incUrl]));
				}
			} else {
				var intGr = new GlideRecord("interaction");
				if (intGr.get(parInc)) {
					sn_interaction.RelatedRecord.createOrUpdate(parInc, gr.getRecordClassName(), gr.getUniqueValue(), "Created", "action_insert");
				}
			}
		}
	},

	type: 'LinkRecordProducerToIncident'
};
