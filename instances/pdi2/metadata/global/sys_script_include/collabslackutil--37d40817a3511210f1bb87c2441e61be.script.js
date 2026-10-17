var CollabSlackUtil = Class.create();
CollabSlackUtil.prototype = {
    initialize: function() {
    },
	base64Encode: function(string) {
		return GlideStringUtil.base64Encode(string);
	},
	toHexString: function(base64) {
		// Decode base64 to binary
		var binaryData = GlideStringUtil.base64DecodeAsBytes(base64);	
		// Convert binary to hexadecimal
		var hex = '';
		for (var i = 0; i < binaryData.length; i++) {
			var byteValue = binaryData[i];
			// Convert byte to hexadecimal
			var hexString = ('0' + (byteValue & 0xFF).toString(16)).slice(-2);
			hex += hexString;
		}
		return hex;
	},
    type: 'CollabSlackUtil'
};
