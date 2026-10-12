var AJAXEmailAddressValidator = Class.create();
AJAXEmailAddressValidator.prototype = Object.extendsObject(AbstractAjaxProcessor, {

	
	// Validate the email addresses returning back a string containing all the invalid addresses
	// as well as the reason why each is invalid
	validate : function() {
		var addresses = this.getParameter('sysparm_addresses');

		return SNC.EmailAddressValidator.validate(addresses).join(', ');
	},
	
	// Validate the email addresses returning back a string containing all the invalid addresses
	filterOutValid : function() {
		var addresses = this.getParameter('sysparm_addresses');

		return SNC.EmailAddressValidator.filterOutValid(addresses).join(', ');
	},

  // Get the system property to check if certain validation needs to be done or not
  checkIfRFC6530IsEnabled : function() {
		return gs.getProperty("glide.email_address.rfc6530.enabled", false);
	},
	
    type: 'AJAXEmailAddressValidator'
});
