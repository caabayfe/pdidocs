var SSHPrivateKeyCredentialUtils = Class.create();

var SSH_PRIVATE_KEY = 'ssh_private_key';
var KMF_ENCRYPTED_PREFIX = '\uFDDE\uFDDF';
var DISCOVERY_CREDENTIALS = 'discovery_credentials';
var MAX_RETRY_NUMBER = 3;
var SSH_PRIVATE_KEY_MIGRATION_PROPERTY = 'glide_encryption.ssh_private_key_migration.success';
var SYS_TRIGGER = 'sys_trigger';
var SSH_PRIVATE_KEY_JOB_PREFIX = 'SSHPrivateKeyMigrationRetry_';
var CREDENTIAL_CRYPTO_MODULE = 'global.com_snc_core_automation_connection_credential_glideencrypter';

SSHPrivateKeyCredentialUtils.keyIsInCorrectFormat = function(key) {
	// Every valid ssh_private_key starts with '-----BEGIN' header
	if (!key.nil() && key.indexOf('-----BEGIN') != 0) 
		return false;
		
	return true;
};

SSHPrivateKeyCredentialUtils.encryptUsingKMFCryptoOperation = function(key) {
	var op = new sn_kmf_ns.KMFCryptoOperation(CREDENTIAL_CRYPTO_MODULE,'SYMMETRIC_WRAPPING').withAlgorithm('AES').withInputFormat('KMFNone');
	return op.doOperation(String(key));
};

SSHPrivateKeyCredentialUtils.decrypt = function(key){
	var op = new sn_kmf_ns.KMFCryptoOperation(CREDENTIAL_CRYPTO_MODULE,'SYMMETRIC_UNWRAPPING').withAlgorithm('AES').withInputFormat('KMF_GLIDE_ENCRYPTER_FORMATTED').withOutputFormat('KMFNone'); 
	return op.doOperation(String(key));
};

SSHPrivateKeyCredentialUtils.include3DESData = function() {
	var gr = new GlideRecord(DISCOVERY_CREDENTIALS);
	gr.query();
	while(gr.next()) {
		var ssh_private_key_value = gr.getValue(SSH_PRIVATE_KEY);
		if (ssh_private_key_value && !ssh_private_key_value.startsWith(KMF_ENCRYPTED_PREFIX)) {
			gs.log('3DES SSH private key found for sys_id: ' + gr.getValue('sys_id'));
			return true;
		}
	}
	gs.log('No 3DES SSH Private Key data found');
	return false; 
};

SSHPrivateKeyCredentialUtils.migrateData = function() {
	var gr = new GlideRecord(DISCOVERY_CREDENTIALS);
	gr.query();
	gs.log("Starting SSH Private Key Migration Process");
	while(gr.next()) {
		var cred_sys_id =  gr.getValue("sys_id");
		try {
			var encrypted_data_old_key = gr.getValue(SSH_PRIVATE_KEY);
			if (encrypted_data_old_key && !encrypted_data_old_key.startsWith(KMF_ENCRYPTED_PREFIX)) {
				gs.log("Re-encrypting ssh_private_key for credential record with sys_id: " + cred_sys_id);
				var decrypted_data_old_key = SSHPrivateKeyCredentialUtils.decrypt(encrypted_data_old_key);
				gr.setWorkflow(false);
				var encrypted_data_new_key = SSHPrivateKeyCredentialUtils.encryptUsingKMFCryptoOperation(String(decrypted_data_old_key));
				gr.setValue('ssh_private_key', encrypted_data_new_key);
				gr.update();
				gs.log("Successfully re-encrypted SSH Private key for credential record with sys_id: " + cred_sys_id);
			}
		} catch (e) {
			gs.error("SSH Private Key Migration Process failed for credential record with sys_id: " + cred_sys_id + " with the exception " + e);
		}
	}
	gs.log("Completed SSH Private Key Migration Process");
};

/**
 * Migrates ssh_private_key data from the legacy 3DES format to the new KMF encryption format.
 * If the migration fails, it will automatically retry up to three times with increasing delays:
 * - First retry after 1 hour
 * - Second retry after 4 hours
 * - Third retry after 24 hours
 */
SSHPrivateKeyCredentialUtils.migrateDataWithRetry = function(retryNumber) {
	gs.setProperty(SSH_PRIVATE_KEY_MIGRATION_PROPERTY, false);
	SSHPrivateKeyCredentialUtils.migrateData();

	if (!SSHPrivateKeyCredentialUtils.include3DESData()) {
		gs.log ("SSH Private Key Migration Job succeeded."); 
		gs.setProperty(SSH_PRIVATE_KEY_MIGRATION_PROPERTY, true);
		return;
	}

	if (retryNumber > MAX_RETRY_NUMBER) {
		gs.error("Exceeded maximum retry attempts (" + MAX_RETRY_NUMBER + ") for SSH private key migration.");
		return;
	}


	var delay = retryNumber * retryNumber * 3600;
	if (retryNumber == 3)
		delay = 24 * 3600;  // Special delay for the 3rd attempt


	var time = new GlideDateTime();
	time.addSeconds(delay);
	gs.log('Next SSH Private Key migration retry scheduled at:  ' + time);
	
	var jobName = SSH_PRIVATE_KEY_JOB_PREFIX + retryNumber;
	var trigger = new GlideRecord(SYS_TRIGGER);
	trigger.addQuery("name", jobName);
	trigger.query();
	if (!trigger.hasNext()){
		trigger.initialize();
		trigger.state = 0;
		trigger.trigger_type = 0;
		trigger.next_action = time;
		trigger.name = jobName;
		trigger.script = "SSHPrivateKeyCredentialUtils.migrateDataWithRetry(" + ++retryNumber + ");";
		if (trigger.insert()) 
			gs.log("Successfully created sys_trigger records for retry job:" + jobName);
		else
			gs.error("Failed to create sys_trigger record for " + jobName);
	} else {
		gs.info ("Sys_trigger record already exists for job:" + jobName);
	}
};

SSHPrivateKeyCredentialUtils.prototype = {
    initialize: function() {
		
    },
    type: 'SSHPrivateKeyCredentialUtils',
};
