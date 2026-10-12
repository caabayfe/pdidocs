var ChannelSendToValidation = Class.create();
ChannelSendToValidation.prototype = {
    initialize: function() {},

    /**
     * Validate if the extension point implementation is valid for the channel
     *
     * @param {String} channelId - The sys_id of the messaging channel.
     *
     * @return {Boolean} true/false - is valid for the channel or not.
     */
    isValid: function(channelId) {

    },

    /**
     * Performs channel specific validation of sendToValue and return the foramatted value
     *
     * @param {String} userTable - The user's table name.
     * @param {String} userDocument - The sys_id of the user.
     * @param {String} sendToValue - Value which needs validation.
     *
     * @return {Object}
     * {
     *  isValid: {Boolean} - Validation status, 
     *  formattedValue: {String} - Formatted value post the validation
     * }
     */
    channelSendToValidation: function(userTable, userDocument, sendToValue) {

    },

    type: 'ChannelSendToValidation'
};
