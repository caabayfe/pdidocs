(function() {
        data.actionPreventedMsg = gs.getMessage("Update failed");
        g_approval_form_request = true;
        var gr = $sp.getRecord();
        if (input && input.action == "checkStatewithCredentials")
            data.approval_state = gr.state.toString();
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
        var approvalFields = $sp.getFields(gr, 'state,sys_created_on');
        if (gr.sys_mod_count > 0)
            approvalFields.push($sp.getField(gr, 'sys_updated_on'));
        data.approval_fields = approvalFields;
        data.approval_state = gr.state.toString();
        data.approval_sys_id = gr.getUniqueValue();
        data.approval_table = gr.getTableName();
        var task = getRecordBeingApproved(gr);
        if (task == null) {
            data.isValid = false;
            return;
        }
        data.label = task.getLabel();
        data.approvedStatusMsg = gs.getMessage("{0} has been approved", task.number);
        data.rejectedStatusMsg = gs.getMessage("{0} has been rejected", task.number);
        data.esignature = {
            username: gs.getUserName(),
            userSysId: gs.getUserID(),
            e_sig_required: checkESig(gr)
        };
        var stream = $sp.getStream(data.approval_table, data.approval_sys_id);
        if ('journal_fields' in stream) {
            var jf = stream.journal_fields;
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
        if (gr.getValue("approver") != gs.getUserID())
            data.approver = gr.approver.getDisplayValue();
        var fieldList = '';
        var displayFields = [];
        var t = {};
        var tableName = task.getTableName();
        var configTable;
        if (tableName == 'sc_request') {
            configTable = tableName + ',sc_req_item'
        }
        else {
            configTable = tableName;
        }
    
        var approvalConfig = $sp.getSpApprovalConfig(configTable);
        
        
        // Default fields for all tables
        var defaultFields = 'number,short_description,opened_by,requested_by,start_date,end_date,quantity,price,recurring_price,recurring_frequency';
        
        // Get table-specific configuration or fallback to default
        var tableConfig = null;
        if (approvalConfig && approvalConfig[tableName]) {
            tableConfig = approvalConfig[tableName];
        }

        // Process display fields from configuration or use defaults
        if (tableConfig && tableConfig.display_fields && tableConfig.display_fields.toString().trim() !== '') {
            fieldList = tableConfig.display_fields.toString();
        } else {
            // Use defaults and add task-specific fields
            fieldList = defaultFields;
            if (task.isValidField('total_price')) fieldList += ',total_price';
            if (task.isValidField('shipping_type')) fieldList += ',shipping_type';
            if (task.isValidField('state')) fieldList += ',state';
            if (task.isValidField('assigned_to')) fieldList += ',assigned_to';
        }
        displayFields = fieldList.split(',').map(function(f) { return f.trim(); });

        t = $sp.getFieldsWithDotPathReferences(task, fieldList);
        t.table = task.getLabel();
        t.sys_created_on = $sp.getField(task, 'sys_created_on');
        t.sys_updated_on = $sp.getField(task, 'sys_updated_on');
        data.record_number = task.number.getDisplayValue();
        data.displayFields = displayFields;
        
        var items = [];
        var itemDisplayFields = [];
        
        var ritmConfig = approvalConfig && (
            (approvalConfig.sc_req_item && approvalConfig.sc_req_item.display_fields) ||
            (approvalConfig.sc_request && approvalConfig.sc_request.sc_req_item && 
            approvalConfig.sc_request.sc_req_item.display_fields)
        ) ? approvalConfig.sc_req_item || approvalConfig.sc_request.sc_req_item : null;
        var itemFieldList = (ritmConfig && ritmConfig.display_fields && ritmConfig.display_fields.toString().trim()) || defaultFields;
        
        itemDisplayFields = itemFieldList.split(',').map(function(f) { return f.trim(); }).filter(function(f) { return f !== ''; });
        var itemsGR = new GlideRecord("sc_req_item");
        itemsGR.addQuery("request", task.sys_id);
        itemsGR.query();
        while (itemsGR.next()) {
            var item = {};
            var itemFields = $sp.getFieldsWithDotPathReferences(itemsGR, itemFieldList);
            item.itemValue = itemsGR.cat_item.getDisplayValue();
            item.short_description = itemsGR.short_description.toString();
            if (itemsGR) {
            item.variables = new GlobalServiceCatalogUtil().getVariablesForTask(itemsGR, true);
            if (item.variables && item.variables.length > 0) {
                item.variableSummarizerWidget = $sp.getWidget('sc-variable-summarizer', {
                variables: item.variables,
                toggle: true,
                hide_control: true,
                task: t.number.value
                });
            }
            }
            item.expanded = false;
            item.displayFields = itemDisplayFields;
            item.allFields = itemFields;
            items.push(item);
        }

        data.items = items;
        data.sys_id = gr.getUniqueValue();

        t.requested_by_label = gs.getMessage('Requestor');
        if(t.requested_by && t.requested_by.type== 'glide_date')
            t.requested_by_label = t.requested_by.label;

        data.task = t;
        if (task) {
            data.variables = new GlobalServiceCatalogUtil().getVariablesForTask(task, true);
            if (data.variables && data.variables.length > 0) {
                data.variableSummarizerWidget = $sp.getWidget('sc-variable-summarizer', {
                    variables: data.variables,
                    toggle: true,
                    hide_control: true,
                    task: t.number.value
                });
                if (data.variables.length > 3) {
                    data.variableSummarizerWidgetLimited = $sp.getWidget('sc-variable-summarizer', {
                        variables: data.variables.slice(0, 3),
                        toggle: true,
                        hide_control: true,
                        task: t.number.value
                    });
                }
            }
        }

        function getRecordBeingApproved(gr) {
            var approvalTargetRecord;
            if (!gr.sysapproval.nil())
            approvalTargetRecord = gr.sysapproval.getRefRecord();
            else
            approvalTargetRecord = gr.document_id.getRefRecord();
            return (approvalTargetRecord.canRead()) ? approvalTargetRecord : null;
        }
        function isTrue(value) { return value === true || value === "true"; }

        // Set up shared data
        var useApprovalRecord = isTrue(options.use_approval_record_activity_stream);
        var recordToUse = useApprovalRecord ? gr : (getRecordBeingApproved(gr) || gr);
        var recordTable = recordToUse.getTableName();
        var recordSysId = recordToUse.getUniqueValue();

        // Set up activity stream
        data.showActivityStream = (options.show_activity_stream !== false && options.show_activity_stream !== "false");
        if (data.showActivityStream) {
            data.ticketConversation = $sp.getWidget('widget-ticket-conversation', {
            placeholder: gs.getMessage("Type your message here..."),
            placeholderNoEntries: gs.getMessage("Start a conversation..."),
            btnLabel: gs.getMessage("Send"),
            sys_id: recordSysId,
            table: recordToUse.getRecordClassName(),
            title: useApprovalRecord ? 
                gs.getMessage("Activity Stream for Approval") : 
                gs.getMessage("Activity Stream for {0}", task.getLabel())
            });
        }

        // Set up attachment widget
        if (recordTable && recordSysId) {
            data.attachmentWidget = $sp.getWidget('9ee37281d7033100a9ad1e173e24d457', {
            record_id: recordSysId,
            record_table: recordTable,
            color: 'default',
            show_title: false
            });
        }
        delete g_approval_form_request;
        })();
