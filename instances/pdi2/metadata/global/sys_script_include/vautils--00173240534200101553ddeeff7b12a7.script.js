var VAUtils = Class.create();
VAUtils.prototype = {
    initialize: function() {
    },

	/* similar validation we do in attachments_util.js for platform and portal */
	validateAttachment: function(file, field) {
		if (field.allowedFileSize) {
			var attrMaxSize = parseInt(field.allowedFileSize);
			var allowedSizeInBytes = attrMaxSize * 1048576; // 1048576 -> MB_TO_BYTES
			if (file.size > allowedSizeInBytes)
				return { type : 'failure', message: gs.getMessage('The size of the uploaded file cannot exceed {0} MB', field.allowedFileSize) };
		}
		if (Array.isArray(field.allowedExtensions) && field.allowedExtensions.length) {
			var dot = file.name.lastIndexOf('.') + 1;
			var suffix = file.name.substring(dot).toLowerCase();
			for (var i = 0; i < field.allowedExtensions.length; i++) {
				if (suffix === field.allowedExtensions[i].toLowerCase())
					return { type : 'success' };
			}
			return { type : 'failure', message: gs.getMessage('The uploaded file type is not permitted; allowed types are {0}', field.allowedExtensions.toString()) };
		}
		return { type : 'success' };
	},
	
	isValidEmail: function(email) {
		var regex = new RegExp("([a-zA-Z0-9_\\-\\.]+)@([a-zA-Z0-9_\\-\\.]+)\.([a-zA-Z]{2,5})");
		return regex.test(email);
	},
	
	
	isValidURL: function(url) {
		var regex = new RegExp("(((ftp|http|https):\/\/)|(www\.))([-\w\.\/#$\?=+@&%_:;]+)");
		return regex.test(url);
	},
	
	
	isValidIPAddress: function(ip) {
		return (SncIPAddressV4.get(ip) || SncIPAddressV6.get(ip));
	},

    type: 'VAUtils'
};
