var ParticipantSuggestionsExtPoint = Class.create();
ParticipantSuggestionsExtPoint.prototype = {
    initialize: function() {
    },

	/**
	 * If the extension point implementation is valid for the BU
	 *
	 * @param {String} table - The table name of the parent record.
	 *
	 * @param {String} document - The sys_id of the parent record.
	 *
	 * @param {String} path - Current path of the user.
	 *
	 * @return {Boolean} If the extension point implementation is valid for the BU
	 **/
    isValid: function(table, document, path) {

    },
	/**
	 * Get list of participant user objects contain sysId and label
	 *
	 * @param {String} table - The table name of the parent record.
	 *
	 * @param {String} document - The sys_id of the parent record.
	 *
	 * @param {String} path - Current path of the user.
	 *
	 * @return {Boolean} List of participant user with sysId and label
	 * For example: [{
	 * 	sysId: "",
	 *  label: ""
	 * }]
	 **/
	getParticipantSuggestions: function(table, document, path) {

	},

    type: 'ParticipantSuggestionsExtPoint'
};
