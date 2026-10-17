var VAGlobalUtil = Class.create();
VAGlobalUtil.prototype = {
    initialize: function() {
		this.logger = new GlideChatbotLoggerSetupUtil("com.glide.cs").setup();
	},

    getDecompressedValue: function(str) {
        try {
            var byteArray = GlideStringUtil.base64DecodeAsBytes(str);
            var decompressedStr = GlideCompressionUtil.expandToString(byteArray);
            return decompressedStr;
        } catch (err) {
            this.logger.error("Error in decompressing the value " + err);
        }
    },
    isAttachmentCopyEnabled: function(tableName) {
        var tablesAsString = gs.getProperty("com.glide.interaction.attachments.copy");
        var tablesArray = tablesAsString.split(",");
        for (var idx = 0; idx < tablesArray.length; idx++) {
            if (tablesArray[idx] == tableName) return true;
        }
        return false;
    },
	getDateFormat: function() {
		return gs.getSession().getDateFormat();
	},
	getDateTimeObj: function (vaContext, displayValue) {
		var days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
		var date = new GlideDateTime();
		var prop = gs.getProperty('com.glide.cs.conv_history_datetime_picker_timezone', 'device');
		var timezone = vaContext.getDeviceTimeZone();
		switch(prop) {
			case 'utc':
				timezone = 'GMT';
				break;
			case 'user_preference':
				timezone = gs.getSession().getTimeZoneName();
				break;
		}
		date.setTimeZone(timezone);
		if (displayValue) {
			date.setDisplayValue(displayValue);
		}
		var value = date.getValue();
		var label = date.getDisplayValue();
		var dayOfWeek = days[date.getDayOfWeek()-1];

		return {
			value: value,
			label: label,
			dayOfWeek: dayOfWeek
		};
	},
    type: 'VAGlobalUtil'
};
