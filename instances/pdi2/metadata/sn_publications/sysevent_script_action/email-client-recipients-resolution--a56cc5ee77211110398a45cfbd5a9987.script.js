/*
Event Parm1 structure ->
{
 "recipientItemSysID":<RECIPPIENT_SYS_ID>, 
 "recipientTable":<RECIPIENT_TABLE_NAME>,
 "emailSysID":"EMAIL_SYS_ID"
}
*/

var recipientDetails = JSON.parse(event.parm1 + '');
var emailClientRecipientListHandler = new sn_publications.EmailClientRecipientListHandler();
var emailRecipientItemAPI = new global.EmailRecipientItemResolution();

try {
    var recipientListGr = emailClientRecipientListHandler.getRecipientListGr(recipientDetails.recipientItemSysID);
	if (recipientListGr) {
		var params = {};
		var emailGr = emailClientRecipientListHandler.getEmailGr(recipientDetails.emailSysID);
		if(recipientListGr.enable_script) {
			var extensionPoints = new GlideScriptedExtensionPoint().getExtensions('sn_publications.RecipientListScriptedParametersProvider');
			for (var i = 0; i < extensionPoints.length; ++i) {
				var point = extensionPoints[i];
				if (point.canResolveParameters(emailGr)) {
					params = point.resolve(emailGr);
					break;
				}
			}
		}
        
		// Skiping insert for fast response
		var recipientUsersList = new sn_publications.RecipientsListApi().refreshRecepientList(recipientListGr, true, params);
		var emailIDs = emailClientRecipientListHandler.getEmailIDs(recipientUsersList);
		emailRecipientItemAPI.updateResolvedRecipientItem(recipientDetails.emailSysID, recipientDetails.recipientItemSysID, 'sn_publications_recipients_list', emailIDs, null);
    }
} catch (err) {
    emailRecipientItemAPI.updateResolvedRecipientItem(recipientDetails.emailSysID, recipientDetails.recipientItemSysID, 'sn_publications_recipients_list', null, err.message);
}
