var GetStandardTicketDescriptionFieldChoices = Class.create();
GetStandardTicketDescriptionFieldChoices.prototype = {
    getChoices: function(tableName) {
		var choiceList = new GlideChoiceList();
		var gr = new GlideRecord(tableName);
		if (!gr.isValid())
			return choiceList;

		var elements = gr.getElements();
		for (var elemIndex=0; elemIndex < elements.length; elemIndex++) {
			var element = elements[elemIndex].getED();
			var elemType = element.getInternalType();
			if (elemType == 'html' || elemType == 'string')
				choiceList.add(element.getName(),element.getLabel());
		
		}
		return choiceList;
	},
    type: 'GetStandardTicketDescriptionFieldChoices'
};
