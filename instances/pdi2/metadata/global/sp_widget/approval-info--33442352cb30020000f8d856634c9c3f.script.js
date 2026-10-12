(function() {
    data.actionPreventedMsg = gs.getMessage("Update failed");
    var gr = $sp.getRecord();
    if (input && input.action == "checkStatewithCredentials")
        data.state = gr.state.toString();

    if (gr == null || !gr.isValid() || !gr.canRead()) {
        data.isValid = false;
        return;
    }

	data.mandatory_comment = options.mandatory_comment;
	data.reject_record_message = gs.getMessage("Provide additional information", "Provide additional information");
    data.isValid = true;
    data.isMine = new ApprovalDelegationUtil().isMyApproval(gr);

    var approverDisplay = gr.approver.getDisplayValue();
    if (!data.isMine && approverDisplay)
        data.approverDisplay = approverDisplay;

    if (approverDisplay) {
        data.approvedMsg = gs.getMessage("Approved by {0}", approverDisplay);
        data.rejectedMsg = gs.getMessage("Rejected by {0}", approverDisplay);
    } else {
        data.approvedMsg = gs.getMessage("Approved");
        data.rejectedMsg = gs.getMessage("Rejected");
    }
    if (input && input.op && data.isMine) {
        gr.state = input.op;
        if (input.isPosting && input.op ==="rejected" && input.journalEntry && input.journalEntryField){
            if (gr.canWrite(input.journalEntryField))
                var displayValue = gs.getMessage('Reason for rejection: {0}', input.journalEntry);
                gr[input.journalEntryField].setDisplayValue(displayValue);
        }
        data.updateID = gr.update();
        if (GlideStringUtil.nil(data.updateID)) {
            // update failed so fetch again for correct values
            gr = $sp.getRecord();
        }
        data.op = "";
    }

    var fields = $sp.getFields(gr, 'state,sys_created_on');

    if (gr.sys_mod_count > 0)
        fields.push($sp.getField(gr, 'sys_updated_on'));

    data.fields = fields;
    data.state = gr.state.toString();
    data.sys_updated_on = gr.sys_updated_on.toString();
    data.sys_id = gr.getUniqueValue();
    data.table = gr.getTableName();
    var record = getRecordBeingApproved(gr);
    data.label = record.getLabel();
    data.approvedStatusMsg = gs.getMessage("{0} has been approved", record.number);
    data.rejectedStatusMsg = gs.getMessage("{0} has been rejected", record.number);
    data.esignature = {
		username:  gs.getUserName(),
        userSysId: gs.getUserID(),
        e_sig_required: checkESig(gr)
    };

    data.stream = $sp.getStream(data.table, data.sys_id);
    if ('journal_fields' in data.stream) {
        var jf = data.stream.journal_fields;
        for(var i=0; i < jf.length; i++) {
            if (jf[i].can_read === true)
                data.hasReadableJournalField = true;
            if (jf[i].can_write === true) {
                data.hasWritableJournalField = true;
            if (!data.primaryJournalField)
                data.primaryJournalField = jf[i];
            else 
                break;
            }
        }   
    }

    function checkESig(approvalGR) {
        var esigRegistryGR = new GlideRecord("e_signature_registry");
        if (!esigRegistryGR.isValid())
            return false;

        var table = approvalGR.getValue("source_table");
        if (!table)
            table = approvalGR.sysapproval.sys_class_name;
        if (!table)
            return false;

        esigRegistryGR.addQuery("enabled", "true");
        esigRegistryGR.addQuery("table_name", table);
        esigRegistryGR.query();
        return esigRegistryGR.hasNext();
    }

    function getRecordBeingApproved(gr) {
        if (!gr.sysapproval.nil())
            return gr.sysapproval.getRefRecord();

        return gr.document_id.getRefRecord();
    }
})();
