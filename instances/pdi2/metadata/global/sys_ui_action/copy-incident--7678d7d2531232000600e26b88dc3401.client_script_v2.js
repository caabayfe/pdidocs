function onClick(g_form) {
    getMessages(["Copy Incident", "Caller", "Failed to copy Incident.", "Include attachments", "Copy", "Create a new incident by copying the current incident. Specify a caller to proceed."], onCopy);

    function onCopy(tMsgs) {
        var fields = [];
        fields.push({
            type: 'reference',
            name: 'caller_id',
            label: tMsgs["Caller"],
            mandatory: true,
            reference: 'sys_user',
            referringTable: 'incident',
            referringRecordId: g_form.getUniqueValue()
        });
        var ga = new GlideAjax('IncidentUtils2');
        ga.addParam('sysparm_name', 'getIncidentCopyAttachDetails');
        ga.addParam('sysparm_sys_id', g_form.getUniqueValue());
        ga.getXMLAnswer(function(response) {
            response = JSON.parse(response + '');
            if (response && response.hasAttachments) {
                fields.push({
                    type: 'boolean',
                    name: 'include_attachments',
                    label: tMsgs["Include attachments"],
                    mandatory: false,
                    value: response.copyAttachProp + '' === "true" ? true : false,
                    referringTable: 'incident',
                    referringRecordId: g_form.getUniqueValue()
                });
            }
            g_modal.showFields({
                title: tMsgs["Copy Incident"],
                size: "md",
                fields: fields,
                confirmTitle: tMsgs["Copy"],
                confirmType: "confirm",
                instruction: tMsgs["Create a new incident by copying the current incident. Specify a caller to proceed."]
            }).then(function(fieldValues) {
                var updatedFields = {};
                fieldValues.updatedFields.forEach(function(field) {
                    updatedFields[field.name] = field.value;
                });
                ga = new GlideAjax('IncidentUtils2');
                ga.addParam('sysparm_name', 'makeIncidentCopy');
                ga.addParam('sysparm_sys_id', g_form.getUniqueValue());
                ga.addParam('sysparm_fields', JSON.stringify(updatedFields));
                ga.getXMLAnswer(function(response) {
                    if (response + '' !== "false")
                        g_aw.openRecord("incident", response + "");
                    else
                        g_form.addErrorMessage(tMsgs["Failed to copy Incident."]);
                });
            });
        });
    }
}
