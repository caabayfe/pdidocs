function enableProcessingFramework() {
    var answer = confirm("All queues marked as automatic job scheduling true will be migrated from manual to automatic scheduling of jobs to process the events. Do you want to continue?");
    if (answer == false)
        return false;
    // g_form.addInfoMessage("Migration has begun; this process will take several minutes to complete.");
    g_list.action('bbfec5d543b002108245e3d3dab8f218', 'sysverb_enable_processing_framework');
}

if (typeof window == 'undefined') {
    GlidePropertiesDB.set('com.glide.processing.framework.enabled', 'true');
    SNC.ProcessingFrameworkUtil.toggleProcessingFrameworkFeature('queue', true);
    action.setRedirectURL('sysevent_queue_list.do');
}
