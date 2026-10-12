function disableProcessingFramework() {
    var answer = confirm("All queues will be migrated from automatic to manual scheduling of jobs to process the events. Do you want to continue?");
    if (answer == false)
        return false;
    g_list.action('7da90195437002108245e3d3dab8f231', 'sysverb_disable_processing_framework');
}

if (typeof window == 'undefined') {
    GlidePropertiesDB.set('com.glide.processing.framework.enabled', 'false');
    SNC.ProcessingFrameworkUtil.toggleProcessingFrameworkFeature('queue', false);
    action.setRedirectURL('sysevent_queue_list.do');
}
