class XMLPayloadComparer {
	static ERROR_MESSAGES = {
		COMPARISON_FAILED: '[XMLPayloadComparer]: Error comparing XMLs - '
	};

	/**
	 * Compare two XML payloads
	 * @param {string} xml1 - First XML payload
	 * @param {string} xml2 - Second XML payload
	 * @returns {Object} Result object containing differ instance, validity, and error message
	 * @throws {Error} If comparison fails
	 */
	static compare(xml1, xml2) {
		try {
			// Create StandardDiffer directly (not using factory)
			const differ = new SNC.StandardDiffer();

			// Perform the diff
			differ.diffXML(xml1, xml2);

			// Check if comparison is valid
			const isValid = differ.isValid();

			if (!isValid) {
				return {
					isValid: false,
					errorMessage: differ.getInvalidMessage(),
					hasChanges: false
				};
			}

			return {
				isValid: true,
				hasChanges: differ.hasChanges()
			};
		} catch (error) {
			throw new Error(XMLPayloadComparer.ERROR_MESSAGES.COMPARISON_FAILED + error.message);
		}
	}

	/**
	 * Check if two XMLs are identical (order-insensitive)
	 * @param {string} xml1 - First XML payload
	 * @param {string} xml2 - Second XML payload
	 * @returns {boolean} True if XMLs are identical, false otherwise
	 */
	static areIdentical(xml1, xml2) {
		const compareResult = XMLPayloadComparer.compare(xml1, xml2);
		return compareResult.isValid && !compareResult.hasChanges;
	}
}
