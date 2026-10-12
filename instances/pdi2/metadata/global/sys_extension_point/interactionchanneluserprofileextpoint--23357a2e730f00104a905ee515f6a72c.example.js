var InteractionChannelUserProfileExtPoint = Class.create();
InteractionChannelUserProfileExtPoint.prototype = {
    initialize: function() {
    },
	
    doesInteractionChangeTriggerProfileUpdate: function(current, previous /*null when interaction is new*/) {
		// Given the current and previous state of an interaction GlideRecord, determine whether
		// the change warrants updating the user_document of the interaction's channel_user_profile.
        return false;
    },

    getUserElementForInteraction: function(interactionGR) {
		// For the given interaction, return the GlideElement for the reference field representing the person
		// that should be saved in the user_document of the interaction's channel_user_profile.
        return null;
    },

	getInteractionUserElementForProfile: function(interactionGR, channelUserProfileGR) {
		// For the given interaction and channel_user_profile, return the GlideElement for the 
		// reference field in interaction that should used to store the value currently in
		// channel_user_profile.user_document.
        return null;
    },
	
    type: 'InteractionChannelUserProfileExtPoint'
};
