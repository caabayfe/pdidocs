var OneExtendGenericProvider = Class.create();
OneExtendGenericProvider.prototype = {
    initialize: function() {},

    toProviderInput: function(normalizedInput) {
        // ... code to convert the normalized input format to a provider-specific format ...
        return normalizedInput;
    },

    fromProviderOutput: function(providerOutput) {
        // ... code to convert the provider-specific output format to the normalized feature output format ...
        return providerOutput;
    },

    type: 'OneExtendGenericProvider'
};
