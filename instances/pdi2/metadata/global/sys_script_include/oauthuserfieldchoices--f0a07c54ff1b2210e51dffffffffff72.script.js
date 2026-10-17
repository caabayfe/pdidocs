var OAuthUserFieldChoices = Class.create();

OAuthUserFieldChoices.prototype = {
    initialize: function() {
        this.ALLOWED_FIELD_TYPES = ['string', 'GUID', 'email'];
    },

    process: function() {
        return this.getChoiceMap();
    },

    getChoiceMap: function() {
		var td = GlideTableDescriptor.get('sys_user');
        var fieldNamesList = td.getActiveFieldNames();
        var choiceList = new GlideChoiceList();
        for (var i = 0; i < fieldNamesList.size(); i++) {
            var ed = td.getElementDescriptor(fieldNamesList.get(i));
            if (!ed)
                continue;
            if (this.ALLOWED_FIELD_TYPES.includes(String(ed.getInternalType())))
                choiceList.add(fieldNamesList.get(i), ed.getLabel());
        }
        return choiceList;
    },
	
    type: 'OAuthUserFieldChoices'
};
