/**
 * @class EFErrorValidator
 * @classdesc Validates error objects before they are saved to the database
 */
class EFErrorValidator {
	/**
	 * Validates that an error data object contains all required fields
	 * @param {Object} error - Error data object (from EFError.getData())
	 * @throws {Error} If any required field is missing
	 */
	static validate(error) {
		if (!error || typeof error !== 'object')
			throw new Error(sn_i18n.Message.getMessage('error_framework', 'EFErrorValidator: Provided error parameter is null or not an object'));
		
		_validateRequiredFields();
		_validateDocumentFields();
		
		function _validateRequiredFields() {
			const baseFields = [
				EFConstants.ERROR_BUILDER_FIELDS.ERROR_CODE,
				EFConstants.ERROR_BUILDER_FIELDS.SOURCE_APPLICATION,
				EFConstants.ERROR_BUILDER_FIELDS.ERROR_CATEGORY,
				EFConstants.ERROR_BUILDER_FIELDS.KEY
			];
			_verifyRequiredFields(baseFields);
			
			const sourceApp = error[EFConstants.ERROR_BUILDER_FIELDS.SOURCE_APPLICATION];
			
			// Validate requiredOrigin fields
			const originFields = _resolveOriginFields(sourceApp);
			_verifyRequiredFields(originFields);
			
			function _resolveOriginFields(sourceAppSysId) {
				const configFields = EFErrorUtil.getConfigProp(sourceAppSysId, EFConstants.CONFIG_PROPERTIES.REQUIRED_ORIGIN);
				
				switch (configFields) {
					case EFConstants.REQUIRED_ORIGIN_VALUES.SOURCE: return [EFConstants.ERROR_BUILDER_FIELDS.ERROR_SOURCE, EFConstants.ERROR_BUILDER_FIELDS.ERROR_SOURCE_TABLE];
					case EFConstants.REQUIRED_ORIGIN_VALUES.BOTH: return [EFConstants.ERROR_BUILDER_FIELDS.ERROR_SOURCE, EFConstants.ERROR_BUILDER_FIELDS.ERROR_SOURCE_TABLE, EFConstants.ERROR_BUILDER_FIELDS.ERROR_INSTANCE, EFConstants.ERROR_BUILDER_FIELDS.ERROR_INSTANCE_TABLE];
					case EFConstants.REQUIRED_ORIGIN_VALUES.NONE: return [];
					default: return [];
				}
			}
			
			function _verifyRequiredFields(fields) {
				for (const field of fields) {
					if (!error[field])
						throw new Error(sn_i18n.Message.getMessage("error_framework", "EFErrorValidator: Missing required field '{field}' for error: ${JSON.stringify(error)}", {field: field}));
				}
			}
		}
		
		function _validateDocumentFields() {
			const DOCUMENT_FIELDS = [
				{
					field: EFConstants.ERROR_BUILDER_FIELDS.ERROR_SOURCE,
					table: EFConstants.ERROR_BUILDER_FIELDS.ERROR_SOURCE_TABLE
				},
				{
					field: EFConstants.ERROR_BUILDER_FIELDS.ERROR_INSTANCE,
					table: EFConstants.ERROR_BUILDER_FIELDS.ERROR_INSTANCE_TABLE
				}
			];
			
			DOCUMENT_FIELDS.forEach(({ field, table}) => {
				// Only validate if the field is present in the error object
				if (!error[field])
					return;
				
				if (!error[table])
					throw new Error(sn_i18n.Message.getMessage("error_framework", "EFErrorValidator: Error object provided without table defined for record reference: {recordRef}", {recordRef: error[table]}));
				
				const recordGr = new GlideRecord(error[table]);
				if (!recordGr.get(error[field]))
					throw new Error(sn_i18n.Message.getMessage("error_framework", "EFErrorValidator: Error object reference for '{recordRef}' not found in '{recordTable}'", {recordRef: error[field], recordTable: error[table]}));
			});
		}
	}
}

EFErrorValidator.logger = EFLogger.forClass('EFErrorValidator');
