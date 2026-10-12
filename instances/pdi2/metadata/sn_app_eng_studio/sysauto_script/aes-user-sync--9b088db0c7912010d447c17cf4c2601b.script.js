var userSyncService = new UserSyncService();
var userQueueService = new UserQueueService();
var syncedIds = '';
var synced;
var failed;
var skipped;

gs.info('Starting AES user sync...');

try {
	var response = userSyncService.sync();

	if (response) {
		synced = response.synced || [];
		failed = response.failed || [];
		skipped = response.skipped || [];

		if (synced.length) {
			syncedIds = synced.map(function(item) {
				return item.sys_id;
			});
			userQueueService.updateMultipleQueue(syncedIds, SyncConstants.SYNCED);

			// Send email out to new users. This uses a seperate flow becuase access granted
			// emails should work with or without the user sync feature.
			sn_fd.FlowAPI.startFlow(SyncConstants.USER_ACCESS_GRANTED_JOB_NAME);
		}

		failed.concat(skipped).forEach(function(item) {
			userQueueService.updateQueue(item.sys_id, {
				state: item.state,
				message: item.message,
			});
		});
	}
	
	var grProcessed = new GlideRecord('sn_app_eng_studio_last_processed');
	grProcessed.get("name", "user.sync");
	
	if (grProcessed.isValidRecord()) {
		grProcessed.setValue('last_processed', new GlideDateTime());
		grProcessed.update();
	}

	gs.info('AES user sync completed');
	
} catch (ex) {
	gs.error('AES User Sync Job: Unhandled Error ' + ex);
}
