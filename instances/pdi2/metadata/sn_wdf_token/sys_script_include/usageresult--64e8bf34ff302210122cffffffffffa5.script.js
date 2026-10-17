var UsageResult = Class.create();
UsageResult.prototype = {
    initialize: function(usageConfiguration) {
        this.usageConfiguration = usageConfiguration;
        this.nativeAmount = 0;
        this.tokenAmount = 0;
        this.datestamp;
        this.result = "success";
        this.notes = "";
    },

	toString: function() {
		return "Usage configuration: " + this.usageConfiguration + "." +
		" Unit amount: " + this.nativeAmount + "." +
		" Token amount: " + this.tokenAmount + "." +
		" Datestamp: " + (!this.datestamp ? "" : this.datestamp.getByFormat("yyyy-MM-dd")) + "." +
		" Result: " + this.result + "." +
		" Notes: " + this.notes + ".";
	},

	getUsageConfiguration: function() {
		return this.usageConfiguration;
	},

    setNativeAmount: function(nativeAmount) {
        this.nativeAmount = nativeAmount;
		return this;
    },

    getNativeAmount: function() {
        return this.nativeAmount;
    },

    setTokenAmount: function(tokenAmount) {
        this.tokenAmount = tokenAmount;
		return this;
    },

    getTokenAmount: function() {
        return this.tokenAmount;
    },

    setDatestamp: function(datestamp) {
        this.datestamp = datestamp;
		return this;
    },

    getDatestamp: function() {
        return this.datestamp;
    },

    setResult: function(result) {
        this.result = result;
		return this;
    },

    getResult: function() {
        return this.result;
    },

    setNotes: function(notes) {
        this.notes = notes;
		return this;
    },

    getNotes: function() {
        return this.notes;
    },

	setError: function(reason) {
		this.result = "failure";
		this.notes = reason;
		return this;
	},

    type: 'UsageResult'
};
