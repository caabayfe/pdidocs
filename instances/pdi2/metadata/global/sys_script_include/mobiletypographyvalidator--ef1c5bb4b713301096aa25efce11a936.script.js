var MobileTypographyValidator = Class.create();
MobileTypographyValidator.prototype = {
    initialize: function() {
    },
	
	isValidName: function(typographyNameEntered) {
		var msgArray = [];
		var validTypographyNames = [];
		validTypographyNames = sn_mobile.TypographyValidator.returnValidTypographyNames();
		
		if (validTypographyNames.indexOf(typographyNameEntered) < 0) {
			msgArray.push(validTypographyNames.toString());
			msg = gs.getMessage("Valid Typography Values: {0}", msgArray);
			gs.addInfoMessage(msg);
			return false;
		}
		
		return true;
	},	

    type: 'MobileTypographyValidator'
};
