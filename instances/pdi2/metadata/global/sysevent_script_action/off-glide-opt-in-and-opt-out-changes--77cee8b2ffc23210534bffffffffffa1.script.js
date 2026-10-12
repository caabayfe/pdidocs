checkOffGlideStatus();

function checkOffGlideStatus() {
    if (event.parm1 == 'opt-in') {
		  gs.info("Received opt-in event for Off Glide experience, triggering activation of Mosaic Log Sync Service");
		  (new MosaicHermesUtils()).activateLogSyncService(true);
    } else {
      // Assuming everything else is an opt-out event
      // Check if the instance is still opted in
      gs.info("Received opt-out event for Off Glide experience, verifying if the instance is still opted in");
      if(!sn_one_extend.GenerativeAIUtility.isInstanceOffGlideEnabled()) {
        // If the instance is not opted in, deactivate the log sync service
        gs.info("Customer instance has opted out for Off Glide experience completely, triggering deactivation of Mosaic Log Sync Service");
        (new MosaicHermesUtils()).deactivateLogSyncService();
      }
    }
}
