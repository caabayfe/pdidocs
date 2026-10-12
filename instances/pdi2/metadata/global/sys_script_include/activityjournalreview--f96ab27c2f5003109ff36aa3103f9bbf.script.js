var ActivityJournalReview = Class.create();
ActivityJournalReview.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	/**
	 * Clear current review for specified document for all users.
	 *
	 * @param documentId
	 */
	clearJournalToReview: function(documentId) {
		documentId = String(documentId || this.getParameter('document_id'));
		this.setJournalToReview(documentId, '');
	},

	/**
	 * Get notification information for specified document, application, and URL.
	 *
	 * @param documentId Current document to check for review
	 * @returns {string} JSON string with notification information
	 */
	getJournalToReview: function(documentId) {
		documentId = String(documentId || this.getParameter('document_id'));
		var supplementalDataList = GlideActivity.getSupplemental(documentId);
		var data = {};

		for (var i = 0; i < supplementalDataList.size(); i += 1) {
			var supplementalData = supplementalDataList.get(i);
			if (isDocumentData(supplementalData)) {
				data = tryParseJSON(supplementalData.payload);
				break;
			}
		}

		return JSON.stringify(data);
	},

	/**
	 * Flag specified journal entry for review for all users.
	 *
	 * We could look up the document ID from the journal entry record, but clients should already have this information,
	 * and it saves an extra lookup.
	 *
	 * @param documentId Document containing journal entry
	 * @param journalId Journal entry to flag for review
	 */
	setJournalToReview: function (documentId, journalId) {
		documentId = String(documentId || this.getParameter('document_id'));
		journalId = String(journalId || this.getParameter('journal_id'));
		var eventId = '';
		var forAllUsers = true;
		var payload = JSON.stringify({ journalUnderReview: journalId || '' });

		GlideActivity.putSupplemental(
			documentId,
			eventId,
			payload,
			forAllUsers
		);
	},

    type: 'ActivityJournalReview'
});


/**
 * Predicate function for a SysActivitySupplemental item; returns true if the item is for document data pertaining to all users.
 *
 * Document data for all users is identified by having a non-empty documentId, an empty eventId, and an empty userSysId.
 *
 * @param {SysActivitySupplemental} supplementalData
 * @returns {boolean} True if the item is for document data pertaining to all users; false otherwise
 */
function isDocumentData(supplementalData) {
	// eventId and userSysId are Java strings, so we must use type coercion to compare them
	return supplementalData.documentId && supplementalData.eventId == '' && supplementalData.userSysId == '';
}

/**
 * Attempt to parse json string into an object. Return an empty object if parsing fails.
 *
 * @param {string} json
 * @returns {object}
 */
function tryParseJSON(json) {
	try {
		return JSON.parse(json);
	} catch {
		return {};
	}
}
