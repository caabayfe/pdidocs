var NotifySMS = Class.create();
NotifySMS.prototype = {
	initialize: function() {
		this.notifyUtils = new global.NotifyUtil();
		this.setRecordToNumberResolver(this.notifyUtils, "getSMSNumberForUser");
	},

	setRecordToNumberResolver: function(scriptIncludeInstance, methodName) {
		this._setRecordToNumberResolver_throws(scriptIncludeInstance, methodName);
	},

	_setRecordToNumberResolver_throws: function(scriptIncludeInstance, methodName) {
		if (!(typeof scriptIncludeInstance === "object") || !methodName)
			throw new Error("Invalid parameters passed to NotifySMS.setRecordToNumberResolver(scriptIncludeInstance, methodName)");
		if (!scriptIncludeInstance[methodName])
			throw new Error("Method " + methodName + " doesn't exist in the given Script Include Instance");
		this.recordToNumberResolverSI = scriptIncludeInstance;
		this.recordToNumberResolverMethod = methodName;
	},

	sendToNumber: function(fromNum, toNum, message, sourceRecord) {
		SNC.Notify.sendSMS(fromNum, toNum, message, sourceRecord);
	},

	sendToNumbers: function(fromNum, toNumbersArray, message, sourceRecord) {
		var driver = this.notifyUtils.getTelephonyDriverFromNotifyNumber(fromNum);
		if (!driver) {
			gs.error("Notify JS Driver not implemented for the given number " + fromNum);
			return;
		}

		for(var i=0; i < toNumbersArray.length; i++) {
			toNumbersArray[i] +=  '';
		}

		var maxSizeForBulkSMS = this.notifyUtils.getMaxSizeForBulkSMS(driver, fromNum);
		/*
		0 means autonomous mode is not available.
		In this case sendBulkSMS will simply iterate over the numbers. 
		Since we have got the full "to" numbers anyway hence it is more optimal to invoke sendBulkSMS once as then it will have to create NotifyPhoneNumber instance only once
		 */
		maxSizeForBulkSMS = maxSizeForBulkSMS === 0 ? toNumbersArray.length : maxSizeForBulkSMS;

		var index = 0;
		while (index < toNumbersArray.length) {
			this.sendBulkSMS(fromNum, toNumbersArray.slice(index, index + maxSizeForBulkSMS), message, sourceRecord);
			index += maxSizeForBulkSMS;
		}
	},
	
	// API offering a drop an async alternative of the Notify API - SNC.Notify.sendBulkSMS() which directly invokes the JAVA layer, 
	// this one does it via a FLow Action to ensure background non UI blocking processing 
	sendBulkSMS: function(fromNum, toNumArray, message, sourceRecord) {
        var inputs = {
			"to_num_array": toNumArray,
			"message": message,
			"from_num": fromNum,
			"source_record_table" : sourceRecord ? sourceRecord.getTableName() : "",
			"source_record_sysid" : sourceRecord ? sourceRecord.getUniqueValue() : ""
		};
		return sn_fd.FlowAPI.getRunner()
					.action("global.trigger_send_bulk_sms")
					.inBackground()
					.withInputs(inputs)
					.run();
			
	},

	sendToUser: function(fromNum, toGr, message, sourceRecord) {
		var toNumber = this.recordToNumberResolverSI[this.recordToNumberResolverMethod](toGr);
		if (toNumber)
			this.sendToNumber(fromNum, toNumber, message, sourceRecord);
		else
			gs.error("No valid To-Number found for given user : " + toGr.getDisplayValue());
	},

	sendToUsers: function(fromNum, toGr, message, sourceRecord) {
		var driver = this.notifyUtils.getTelephonyDriverFromNotifyNumber(fromNum);
		if (!driver) {
			gs.error("Notify JS Driver not implemented for the given number " + fromNum);
			return;
		}

		var maxSizeForBulkSMS = this.notifyUtils.getMaxSizeForBulkSMS(driver, fromNum);
		/*
		0 means autonomous mode is not available.
		In this case the bulkSMS chunk size is derived from the glide.notify.bulksms.chunksize property
		The default value for this property is 1000.
		 */
		maxSizeForBulkSMS = maxSizeForBulkSMS === 0 ? parseInt(gs.getProperty("glide.notify.bulksms.chunksize", '1000')) : maxSizeForBulkSMS;

		this._iterateUsersAndSendSMS(fromNum, toGr, message, sourceRecord, maxSizeForBulkSMS);
	},

	_iterateUsersAndSendSMS: function(fromNum, toGr, message, sourceRecord, maxSizeForBulkSMS) {
		var index = 0;
		var toNumbersArray = [];
		toGr.query();
		while (toGr.next()) {
			var toNumber = this.recordToNumberResolverSI[this.recordToNumberResolverMethod](toGr);
			if (toNumber) {
				toNumbersArray.push(toNumber + '');
				index++;
			} else {
				gs.error("No valid To-Number found for given user : " + toGr.getDisplayValue());
			}

			if ((index === maxSizeForBulkSMS || !toGr.hasNext()) && toNumbersArray.length > 0) {
				this.sendBulkSMS(fromNum, toNumbersArray, message, sourceRecord);
				index = 0;
				toNumbersArray = [];
			}
		}
	},

	type: 'NotifySMS'
};
