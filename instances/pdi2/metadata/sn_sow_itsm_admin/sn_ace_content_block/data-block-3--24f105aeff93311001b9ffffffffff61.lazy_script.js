(function(context, pageParams, blockcontext) {
    var recipientsList = blockcontext.selectedRecipientsList;
    var storedRecipientsList = blockcontext.storedRecipientsList;
    var recipientsToRemove = [];
    var recipientsToAdd = [];
    storedRecipientsList.forEach(function(storedRecipient) {
        var found = false;
        recipientsList.forEach(function(recipient) {
            if (recipient.id == storedRecipient.id) {
                found = true;
            }
        });
        if (!found) {
            recipientsToRemove.push(storedRecipient);
        }
    });
    recipientsList.forEach(function(recipient) {
        var found = false;
        storedRecipientsList.forEach(function(storedRecipient) {
            if (recipient.id == storedRecipient.id) {
                found = true;
            }
        });
        if (!found) {
            recipientsToAdd.push(recipient);
        }
    });

    recipientsToRemove.forEach(function(recipient) {
        var contactDefGR = new GlideRecord("comm_contact_definition");
        contactDefGR.addQuery("comm_plan_definition", blockcontext.planSysId);
        contactDefGR.addQuery("type", recipient.table);
        contactDefGR.addQuery(recipient.table, recipient.id);
        contactDefGR.query();
        if (contactDefGR.next()) {
            contactDefGR.deleteRecord();
        }
    });
    recipientsToAdd.forEach(function(recipient) {
        var contactDefGR = new GlideRecord("comm_contact_definition");
        contactDefGR.initialize();
        contactDefGR.setValue("comm_plan_definition", blockcontext.planSysId);
        contactDefGR.setValue("type", recipient.table);
        contactDefGR.setValue(recipient.table, recipient.id);
        contactDefGR.insert();
    });
    return {
        showPlanUpdatedAlert: true,
    };
})(context, pageParams, blockcontext);
