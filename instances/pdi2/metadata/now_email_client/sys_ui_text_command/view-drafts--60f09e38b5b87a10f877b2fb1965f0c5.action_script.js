function getDraftsForPicker(recordTable, recordSysId, query) {
    var answer;
    var items = [];
    var grCheck = new GlideRecord('sys_email_draft');
    grCheck.addQuery('author', gs.getUserID());
    grCheck.addQuery('target_table', recordTable);
    grCheck.addQuery('target_record', recordSysId);
    grCheck.query();
    if (!grCheck.hasNext()) {
        answer = {
            message: gs.getMessage('No drafts found for this record')
        };
        return answer;
    }

    var gr = new GlideRecord('sys_email_draft');
    gr.addQuery('author', gs.getUserID());
    gr.addQuery('target_table', recordTable);
    gr.addQuery('target_record', recordSysId);

    function getDraftAttachments(draftSysId) {
        var attachments = [];
        var attGr = new GlideRecord('sys_attachment');
        attGr.addQuery('table_name', 'sys_email_draft');
        attGr.addQuery('table_sys_id', draftSysId);
        attGr.query();
        while (attGr.next()) {
            attachments.push({
                sys_id: attGr.getValue('sys_id'),
                file_name: attGr.getValue('file_name'),
                content_type: attGr.getValue('content_type'),
                size_bytes: attGr.getValue('size_bytes')
            });
        }
        return attachments;
    }

    function getRecipientsForDraft(draftSysId, type) {
        var emails = [];
        var recGr = new GlideRecord('sys_email_draft_recipient');
        recGr.addQuery('email_draft', draftSysId);
        recGr.addQuery('recipient_type', type); // 'To', 'Cc', 'Bcc'
        recGr.query();
        while (recGr.next()) {
            emails.push({
                emailAddress: recGr.getValue('email_address'),
                displayName: recGr.getValue('display_name') || recGr.getValue('email_address'),
                avatar: "",
                recipientSource: recGr.getValue('recipient_source') || "",
                recipientSourceTable: recGr.getValue('recipient_source_table') || ""
            });
        }
        return emails;
    }

    function buildPayload(gr) {
        var sysId = gr.getValue('sys_id');
        return {
            body: gr.getValue('body_html') || gr.getValue('body'),
            subject: gr.getValue('subject'),
            to: getRecipientsForDraft(sysId, 'To'),
            cc: getRecipientsForDraft(sysId, 'Cc'),
            bcc: getRecipientsForDraft(sysId, 'Bcc'),
            attachments: getDraftAttachments(sysId),
            author: gr.getValue('author'),
            important: gr.getValue('important') == '1',
            replyTo: gr.getValue('reply_to'),
            esignEnabled: gr.getValue('esign_enabled') == '1',
            encryptionEnabled: gr.getValue('encryption_enabled') == '1',
            from: gr.getValue('from'),
            sys_id: sysId
        };
    }

    if (query == "") {
        gr.orderByDesc('sys_updated_on');
        gr.setLimit(5);
        gr.query();
        while (gr.next()) {
            var payload = buildPayload(gr);
            items.push({
                id: gr.getValue('sys_id'),
                displayContent: gr.getValue('body_html') || gr.getValue('body'),
                title: gr.getValue('subject'),
                replaceContent: gr.getValue('body_html') || gr.getValue('body'),
                actionPayload: JSON.stringify(payload),
                name: gr.getValue('subject') || 'Draft',
                actionType: "replace_content"
            });
        }
        var draftCount = items.length;
        answer = {
            items: items,
            header: (draftCount >= 5)
                ? 'Showing 5 recent drafts'
                : 'Showing all drafts'
        };
    } else {
        var qc = gr.addQuery('subject', 'CONTAINS', query);
        qc.addOrCondition('body', 'CONTAINS', query);
        gr.orderByDesc('sys_updated_on');
        gr.query();
        while (gr.next()) {
            var payload = buildPayload(gr);
            items.push({
                id: gr.getValue('sys_id'),
                displayContent: gr.getValue('body_html') || gr.getValue('body'),
                title: gr.getValue('subject'),
                replaceContent: gr.getValue('body_html') || gr.getValue('body'),
                actionPayload: JSON.stringify(payload),
                name: gr.getValue('subject') || 'Draft',
                actionType: "replace_content"
            });
        }
        if (!items.length) {
            answer = {
                templateMessage: {
                    illustration: "no-search-results",
                    headingLabel: gs.getMessage('No drafts found'),
                    content: gs.getMessage('Try a different search')
                }
            };
        } else {
            answer = {
                items: items
            };
        }
    }
    return answer;
}

answer = getDraftsForPicker(recordTable, recordSysId, query);
