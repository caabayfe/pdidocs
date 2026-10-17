var SGAlertHelper = Class.create();
SGAlertHelper.prototype = {
    initialize: function() {
    },
	getPrimaryButtonRefQual: function(){
		return "type=redirection^context=record^destination_type=screen";
	},

    type: 'SGAlertHelper'
};
