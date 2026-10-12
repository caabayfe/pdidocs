var IPAddressValidator = Class.create();
IPAddressValidator.prototype = Object.extendsObject(AbstractAjaxProcessor, {

	ajaxFunction_validateDesktop: function() {
		var table = this.getParameter('table');
		var fields = this.getParameter('fields');
		var values = this.getParameter('values');
		return JSON.stringify(IPAddressDataFormatter.areColumnsValid(table, fields, values));
	},
	
	ajaxFunction_validateMobileAndServicePortal: function() {
		var table = this.getParameter('table');
		var field = this.getParameter('field');
		var value = this.getParameter('value');
		return IPAddressDataFormatter.isColumnValid(table, field, value);
	},
	
	ajaxFunction_validateStrict: function() {
		var ip = this.getParameter('ip_value');

		return SncIPAddress.isValid(ip);
	},

	ajaxFunction_validateIPv4: function() {
		var ip = this.getParameter('ip_value');

		return SncIPAddress.isV4(ip);
	},
	
    type: 'IPAddressValidator'
});
