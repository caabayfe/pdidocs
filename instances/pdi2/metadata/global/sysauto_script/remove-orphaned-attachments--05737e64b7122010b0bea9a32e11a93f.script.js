/*
 Delete orphaned attachments from file attachments and image attachments from WS
*/

var attachmentsUtil = new global.AttachmentActionsUtil();
var attachmentsToDelete = getAttachmentIds();
attachmentsUtil.deleteAttachments(attachmentsToDelete);

//cleanup entry records
cleanupProcessedEntries();

function getAttachmentIds() {

    var attachmentIds = [];

    var grCleanerEntry = new GlideRecord("sys_attachment_cleaner_entry");
    //get queued records older than 5 days
    grCleanerEntry.addQuery("status", "QUEUED");
    grCleanerEntry.addQuery("sys_created_on", "<", gs.daysAgoStart(5));
    grCleanerEntry.query();

    while (grCleanerEntry.next()) {
        attachmentIds.push(grCleanerEntry.attachment + '');
        //update status
        grCleanerEntry.status = "PROCESSED";
        grCleanerEntry.update();
    }

    return attachmentIds.join(",");
}

function cleanupProcessedEntries() {
    var grCleanerEntry = new GlideRecord("sys_attachment_cleaner_entry");
    //get processed records older than 15 days
    grCleanerEntry.addQuery("status", "PROCESSED");
    grCleanerEntry.addQuery("sys_created_on", "<", gs.daysAgoStart(15));
    grCleanerEntry.deleteMultiple();
}
