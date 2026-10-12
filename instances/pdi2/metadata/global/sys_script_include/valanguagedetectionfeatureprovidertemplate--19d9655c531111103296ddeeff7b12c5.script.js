var VALanguageDetectionFeatureProviderTemplate = Class.create();
VALanguageDetectionFeatureProviderTemplate.prototype = {
    initialize: function() {
    },
	
	/**
	* Adapt a Feature's "normal format" input param to the "provider-specific" input param format.
	* Subclasses should override this.
	* 
	* @param normalizedInput
	* @return provider-specific input param format
	*/
	toProviderInput: function(normalizedInput) {
		// ... code to convert the normalized input format to a provider-specific format ...
		return normalizedInput;
	},
	
	/**
	* Adapt a Feature Provider's output from it "provider-specific" format to its "normalized" format.
	* Subclasses should override this.
	* 
	* @param providerOutput
	* @return normalized format of the output
	*/
	fromProviderOutput: function(providerOutput) {
		// ... code to convert the provider-specific output format to the normalized feature output format ...
		return providerOutput;
	},

    type: 'VALanguageDetectionFeatureProviderTemplate'
};
