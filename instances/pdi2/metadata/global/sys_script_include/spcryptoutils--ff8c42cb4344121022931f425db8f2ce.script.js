var SPCryptoUtils = Class.create();
SPCryptoUtils.prototype = Object.extendsObject(AbstractAjaxProcessor, {

	hasCryptoModuleForTable: function() {
		var tableName = this.getParameter('sysparm_table_name') || '';
		if (gs.nil(tableName))
			return false;

    		// First, check for encrypted row conditions. If present, skip crypto module selection.
		var enc = new sn_field_encryption_starter.EncryptedRowConditionsCacheAPI();
		var isAttachmentRowConfigurationNotPresent = enc.isAttachmentRowConfigurationNotPresent(tableName);
		if (!isAttachmentRowConfigurationNotPresent) {
			// Row-level encryption exists; do not allow crypto module selection.
			return false;
		}

		// Checking if table ED is encrypted. 
		var gr = new GlideRecordSecure(tableName);
		if (!gr.isValid() || !GlideSecurityManager.tableLevelACLAllow(gr, "read"))
			return false;
		var isEncrypted = gr.getED().isEncrypted();
		if (!isEncrypted) {
			return false;
		}
		// Checking if the table has any cryptomodule set. 
		var encryptionChoices = gs.getSession().getCryptoModulePickerForTableWithSingleModule(tableName).getChoices();
		if (encryptionChoices)
			return encryptionChoices.getSelected().getSize() >= 1;
		return false;
	},

    type: 'SPCryptoUtils'
});
