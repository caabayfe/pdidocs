scheduleUserHasRoleJob();

function scheduleUserHasRoleJob() {
    var JOB_ID = "3824c9a04f030110c6e235e552ce0b59";
    var SLUSHBUCKET = "glide.ui.schedule_slushbucket_save_for_group_roles";
    var slushbucketProperty = new GlideRecord("sys_properties");
    slushbucketProperty.addQuery("name", SLUSHBUCKET);
    slushbucketProperty.addQuery("value", true);
    slushbucketProperty.query();
    if (!slushbucketProperty.next())
        return;

    if (GlidePluginManager.isZboot() || bypassAutoJobExecution())
        return;

    var job = new GlideRecord("sysauto_script");
    job.addQuery("sys_id", JOB_ID);
    job.addActiveQuery();
    job.query();
    if (job.next())
        updateJobTrigger(JOB_ID);

}


/*
 * Method allows to skip the job trigger creation during the upgrade
 * This option is for customers with a very large sys_user_has_role table that might
 * take a day to process.
 */
function bypassAutoJobExecution() {
    var SKIP_TRIGGER = "glide.skip.auto_slushbucket_job";
    var bypassJobScheduler = new GlideRecord("sys_properties");
    bypassJobScheduler.addQuery("name", SKIP_TRIGGER);
    bypassJobScheduler.addQuery("value", true);
    bypassJobScheduler.query();
    if (bypassJobScheduler.next())
        return true;
    return false;
}

/*
 * Method to update the zbooted job trigger with 
 * the execution time
 */
function updateJobTrigger(job) {
    gs.info("scheduling job!");
    var TRIGGER_CLASS = "com.snc.automation.ScriptJob";
    var DOCUMENT_NAME = "Addresses User Has Role Errors";
    var STATE = "Ready";
    var jobExecutionTime = new String(getExecutionTime());
    var trigger = new GlideRecord("sys_trigger");
    trigger.addQuery("document_key", job);
    trigger.addQuery("name", DOCUMENT_NAME);
    trigger.query();
    if (trigger.next()) {
        trigger.setValue("next_action", jobExecutionTime);
        trigger.setValue("upgrade_safe", false);
        trigger.setValue("trigger_type", 0);
        trigger.setValue("state", STATE);
        trigger.setValue("trigger_class", TRIGGER_CLASS);
        trigger.setWorkflow(false);
        trigger.update();
    }
}

/*
 * Function calculates time four hours from now.
 */
function getExecutionTime() {
    var offset = 0;
    var DELAY = 4 * 3600 * 1000;
    var now = new GlideDateTime();
    var tzOffset = now.getTZOffset();
    if (now.isDST())
        offset = now.getDSTOffset();
    now.add(DELAY + offset + (-1) * tzOffset);
    return now.getDisplayValue();
}
