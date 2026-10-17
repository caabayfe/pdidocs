
(function(context, pageParams, blockcontext){
	var recipientsList = blockcontext.selectedRecipients;
    recipientsList.forEach(function(recipient) {
        var contactDefGR = new GlideRecord("comm_contact_definition");
        contactDefGR.initialize();
        contactDefGR.setValue("comm_plan_definition", blockcontext.recordSysId);
        contactDefGR.setValue("type", recipient.table);
        contactDefGR.setValue(recipient.table, recipient.id);
        contactDefGR.insert();
    });
})(context, pageParams, blockcontext);
