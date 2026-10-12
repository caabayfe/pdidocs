migrateMobileAnalyticsSettings();

function migrateMobileAnalyticsSettings() {
	var channelGr = new GlideRecord('sys_analytics_channel');
	channelGr.addQuery('name', 'mobile');
	channelGr.query();
	channelGr.next();
	if (!channelGr.isValidRecord()) {
		gs.error('Error during Mobile Analytics setting migration, could not find \'mobile\' Analytics Channel');
		return;
	}
	
	//Get rid of all Video Settings
    deleteAllRecordsFromTable('sys_mobile_analytics_video_settings');

    // Move all existing entries to the new tables
    var mobileSettingsGR = new GlideRecord("sys_mobile_analytics_settings");
    mobileSettingsGR.setWorkflow(false);
	mobileSettingsGR.query();
    while (mobileSettingsGR.next()) {
        migrateMobileSetting(mobileSettingsGR, channelGr.getUniqueValue());
    }
}

function migrateMobileSetting(mobileSettingGR, channelSysId) {	
	var apiAuth = mobileSettingGR.getValue('api_auth');
	var apiKey = mobileSettingGR.getValue('api_key');
	var nativeClientId = mobileSettingGR.getValue('application');
	var enabled = mobileSettingGR.getValue('enabled');
	
	//Is our ApiKey valid?
	if (apiKey != (gs.getProperty('instance_id') + ':' + nativeClientId)) {
		gs.error('Error during Mobile Analytics setting migration, apiKey: ' + apiKey + ', is invalid for Native Client: ' + nativeClientId);
		return;
	}
	
	//Is our ApiAuth valid?
	if (!apiAuth) {
		gs.error('Error during Mobile Analytics setting migration, apiAuth is empty for Native Client: ' + nativeClientId);
		return;
	}
	
	//Does our native client reference exist?
	var nativeClientGR = new GlideRecord('sys_sg_native_client');
	nativeClientGR.get(nativeClientId);
	if (!nativeClientGR.isValidRecord()) {
		gs.error('Error during Mobile Analytics setting migration, invalid Native Client reference');
		return;
	}

	var bucketSysId = createBucketEntry(nativeClientGR, enabled, channelSysId);
	if (bucketSysId) {
		createAuthEntry(nativeClientId, bucketSysId, apiAuth);
		//Finally delete the entry if at least the bucket was created
		mobileSettingGR.deleteRecord();
	}
}

function createBucketEntry(nativeClientGr, enabled, channelId) {
	var gr = new GlideRecord('sys_analytics_bucket');
	gr.setWorkflow(false);
	gr.setValue('application_name', nativeClientGr.getValue('name'));
	gr.setValue('enabled', enabled);
	gr.setValue('analytics_channel', channelId);
	gr.setValue('bucket_document_id', nativeClientGr.getUniqueValue());
	gr.setValue('bucket_table_name', 'sys_sg_native_client');
	gr.setValue('bucket_type', 'mobile_' + nativeClientGr.getValue('type'));
	var bucketSysId = gr.insert();
	if (!bucketSysId) {
		gs.error('Error during Mobile Analytics setting migration, unable to create Analytics Bucket Entry for Native Client: ' + nativeClientGr.getUniqueValue() + ', error was: ' + gr.getLastErrorMessage());
	}
	return bucketSysId;
}

function createAuthEntry(nativeClientId, bucketId, apiAuth) {
	var gr = new GlideRecord('sys_analytics_authentication');
	gr.setWorkflow(false);
	gr.setValue('analytics_bucket', bucketId);
	gr.setValue('api_auth', apiAuth);
	if (!gr.insert()) {
		gs.error('Error during Mobile Analytics setting migration, unable to create Analytics Authentication Entry for Native Client: ' + nativeClientId + ', error was: ' + gr.getLastErrorMessage());
	}
}

function deleteAllRecordsFromTable(tableName) {
    var gr = new GlideRecord(tableName);
    gr.setWorkflow(false);
    gr.query();
    gr.deleteMultiple();
}
