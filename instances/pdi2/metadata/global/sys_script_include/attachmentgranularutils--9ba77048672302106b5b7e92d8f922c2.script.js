var AttachmentGranularUtils = Class.create();
AttachmentGranularUtils.prototype = {

    CHOICES: ['files', 'gallery', 'camera'],

    initialize: function() {},

    cleanCommasAndBlanks: function(hiddenSources) {
        hiddenSources = hiddenSources.trim();
        // Step 1: Remove spaces around commas
        hiddenSources = hiddenSources.replace(/\s*,\s*/g, ',');
        // Step 2: Remove extra commas
        hiddenSources = hiddenSources.replace(/,\s*,+/g, ',');
        // Step 3 : Remove leading or trailing commas if necessary
        hiddenSources = hiddenSources.replace(/^,|,$/g, '');
        return hiddenSources;
    },

    isValid: function(hiddenSources) {
        let choices = this.CHOICES;
        hiddenSources = this.cleanCommasAndBlanks(hiddenSources);
        let arr = hiddenSources.split(',');
        if (arr.length > choices.length - 1) {
            gs.addErrorMessage(gs.getMessage("You can only add up to the allowed number of values for the 'HiddenAttachmentSources' attribute. Remove any extra values and try again."));
            return false;
        }

		// This pattern ensures that the entire string matches exactly one or more of the specified choice, separated by commas, and nothing else.
        let patternString = '^(allValues)(,(allValues))*$';
		const choicesPattern = choices.join('|');
		patternString = patternString.replaceAll('allValues', choicesPattern);
        const regex = new RegExp(patternString, 'i');
        if (!regex.test(hiddenSources)) {
            gs.addErrorMessage(gs.getMessage("The 'HiddenAttachmentSources' attribute includes a value that is not supported."));
            return false;
        }

        return true;
    },

    type: 'AttachmentGranularUtils'
};
