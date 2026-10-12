
// If the property is not defined in glide, the default value returned is false. So, it is not completed
// we queue job trigger.
if (!pm.isZboot() && !GlideProperties.getBoolean('glide.sys_attachment_zip.module_key_backfill.completed'))
    queueJobTrigger();

function queueJobTrigger() {
    gs.log('Running fix script to backfill Module Key ID headers in Zip Sys Attachments', 'ZipAttachmentsBackfill');
    var JOB_NAME = "Backfill Module Key ID in Encrypted Attachment ZIPs";
    var JOB_ID = "8eff6a3ecce449b389fc1bbb9c1d6389";
    var READY_STATE = 0;
    var RUN_ONCE = 0;
    var JOB_EXECUTION_TIME = new GlideDateTime();
	JOB_EXECUTION_TIME.addSeconds(3600);
    var trigger = new GlideRecord("sys_trigger");
    trigger.setValue("state", READY_STATE);
    trigger.setValue("next_action", JOB_EXECUTION_TIME);
    trigger.setValue("job_id", JOB_ID);
    trigger.setValue("name", JOB_NAME);
    trigger.setValue("trigger_type", RUN_ONCE);
    trigger.insert();
}
