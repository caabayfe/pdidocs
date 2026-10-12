var PhoneNumberValidation = Class.create();
PhoneNumbereValidation.prototype = {
    initialize: function() {},

    /**
     * Validate if the extension point implementation is valid for a user table
     *
     * @param {String} channelId - The sys_id of the messaging channel.
     *
     * @return {Boolean} true/false - is valid for the channel or not.
     */
    isValidForTable: function(userTable) {

    },

    /**
     * Do channel specific validate for the sendToValue field
     *
     * @param {String} userTable - The user's table name.
     * @param {String} userDocument - The sys_id of the user.
     * @param {String} sendToValue - Value which needs validation.
     *
     * @return {Object}
     * {
     *  isValid: {Boolean} - Validation status - false if not valid, 
     *  formattedValue: {String} - Formatted value post the validation - null if isValid is false
     * }
     */
    validatePhoneNumberFormat: function(userTable, userId, phoneNumber) {

    },

    type: 'PhoneNumberValidation'
};
