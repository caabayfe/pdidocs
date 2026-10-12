var OneAPIFeatureProviderTemplate = Class.create();
OneAPIFeatureProviderTemplate.prototype = {
    initialize: function() {
    },
	
	/**
	* Adapt a Feature's "normal format" input param to the "provider-specifc" input param format.
	* Subclasses should override this.
	* 
	* @param normalizedInput
	* @return provider-specifc input param format
	*/
	toProviderInput: function(normalizedInput) {
		// ... code to convert the normalized input format to a provider-specific format ...
		return normalizedInput;
	},
	
	/**
	* Adapt a Feature Provider's output from it "provider-specifc" format to its "normalized" format.
	* Subclasses should override this.
	* 
	* @param providerOutput
	* @return normalized format of the output
	*/
	fromProviderOutput: function(providerOutput) {
		// ... code to convert the provider-specific output format to the normalized feature output format ...
		return providerOutput;
	},

    type: 'OneAPIFeatureProviderTemplate'
};
