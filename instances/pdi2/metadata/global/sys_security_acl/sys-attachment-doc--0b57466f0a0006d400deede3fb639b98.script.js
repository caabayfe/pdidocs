answer = false //default;
var attachmentID = current.sys_attachment.toString();

//see if we already check the parent attachment access
if (typeof attachmentCheckRead != "undefined") {
    if (attachmentCheckRead.hasOwnProperty(attachmentID))
        answer = attachmentCheckRead[attachmentID];
    else {
        //check access and save in global variable
        var canRead = canReadParentRecord();
        attachmentCheckRead[attachmentID] = canRead;
        answer = canRead;
    }
} else {
    //no global variable yet, create it and add property for this attachment
    var canRead = canReadParentRecord();
    var attachmentCheckRead = {};
    attachmentCheckRead[attachmentID] = canRead;
    GlideController.putGlobal("attachmentCheckRead", attachmentCheckRead);
    answer = canRead;
}

function canReadParentRecord() {
    // current user will not be able to read the parent record if it's in a differnt domain:
    var gr = new GlideRecord('sys_attachment');
	if (!gr.get(current.sys_attachment))
		return false;
	
    var canRead = gs.hasRole('maint');
    if (current.sys_attachment.state != 'not_available' && current.sys_attachment.state != 'pending')
        canRead = current.sys_attachment.getRefRecord().canRead();
    return canRead;
}
