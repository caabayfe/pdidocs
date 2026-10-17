var PlatformEncryptedTables = Class.create();
var MASS_SIGN_RECORDS = 'mass_sign_records';
var SIGN_SPECIFIC_RECORDS = 'sign_specific_records';
var MASS_SIGN_ATTACHMENTS = 'mass_sign_attachments';
var SIGN_SPECIFIC_ATTACHMENTS = 'sign_specific_attachments';
var SIGN_UPDATE_SET = 'sign_update_set';
var SN_KMF_SIGNATURE_CONFIGURATION = 'sn_kmf_signature_configuration';
var SIGN_ATTACHMENT = 'sign_attachment';
var TABLE_NAME = 'table_name';
var COMMA = ','; 
var ROT_PROPERTY = 'com.snc.csf.servicenow_root_of_trust.disabled';
var ATTEST_MODULE_SYS_ID = '75bdd8c2c70111109d59fa49f4c26031';
var OPEN_BRACKET = ' [';
var CLOSE_BRACKET = ']';
var MISSING_KEYPAIR_LOG_MESSAGE = 'ServiceNow Root of Trust is disabled, but customer keys are not provided. Please import an asymmetric key pair to cm_code_attest module.';
var CODE_SIGNING_SOURCE = 'Code Signing';
PlatformEncryptedTables.prototype = {

	process: function(dependent_value) {
		var choiceList = new GlideChoiceList();
		if (dependent_value !== null) {
			var tableJson;
			// DEF0457723: fetch tables in JS for mass sign and sign specific jobs
			if (dependent_value === MASS_SIGN_RECORDS || dependent_value === SIGN_SPECIFIC_RECORDS)
				tableJson = this.getTablesForChosenJobType(dependent_value, false);
			else if (dependent_value === MASS_SIGN_ATTACHMENTS || dependent_value === SIGN_SPECIFIC_ATTACHMENTS)
				tableJson = this.getTablesForChosenJobType(dependent_value, true);
			// default to legacy behavior if not the above four job types
			else
				tableJson = JSON.parse(new SNC.MassEncryptionJob().getSupportedTableChoicesForJobType(dependent_value));
			for (var tableValue in tableJson)
				choiceList.add(tableValue, tableJson[tableValue]);
        }
		return choiceList;
	},

	getTablesForChosenJobType: function(job_type, sign_attachment) {
		if (gs.getProperty(ROT_PROPERTY) === 'true' && gs.nil(new global.CodeSigningSignatureMigrationAPI().getActiveKMFVerifyCertSysId(ATTEST_MODULE_SYS_ID))) {
			gs.log(MISSING_KEYPAIR_LOG_MESSAGE, CODE_SIGNING_SOURCE);
			return {};
		}
		var res = {};
		var sigConfigGr = new GlideRecord(SN_KMF_SIGNATURE_CONFIGURATION);
		sigConfigGr.addQuery(SIGN_ATTACHMENT, sign_attachment);
		sigConfigGr.query();
		while (sigConfigGr.next()) {
			var tableName = sigConfigGr.getValue(TABLE_NAME);
			res[job_type + COMMA + tableName] = new GlideRecord(tableName).getClassDisplayValue() + OPEN_BRACKET + tableName + CLOSE_BRACKET;
		}
		return res;
	},

    type: 'PlatformEncryptedTables'
};
