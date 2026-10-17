function onClick() {
    getMessages(["Reopen", "Additional comments (Customer visible)", "Cancel"], openModal);

    function openModal(tMsgs) {
        var fields = [];
        fields.push({
            type: 'textarea',
            name: 'comments',
            label: tMsgs["Additional comments (Customer visible)"],
            mandatory: true
        });
        g_modal.showFields({
            size: "md",
            resizableConfig : {
                enableResizable: true,
                resizableMinWidth: 420,
                resizableMinHeight: 133
            },
            fields: fields,
            title: tMsgs["Reopen"],
            cancelTitle: tMsgs["Cancel"],
            confirmTitle: tMsgs["Reopen"]
        }).then(function(fieldValues) {
            var updatedFields = {};
            fieldValues.updatedFields.forEach(function(field) {
                updatedFields[field.name] = field.value;
            });
            ga = new GlideAjax('sn_sow_inc.SOWIncidentUtilsAjax');
            ga.addParam('sysparm_name', 'reopenIncident');
            ga.addParam('sysparm_sys_id', g_form.getUniqueValue());
            ga.addParam('sysparm_updated_fields', JSON.stringify(updatedFields));
            ga.getXMLAnswer(function(response) {
                var responseObj = JSON.parse(response);
                if (responseObj.status == "success") {
                    g_form.reload();
                    g_form.addInfoMessage(responseObj.message);
                } else
                    g_form.addErrorMessage(responseObj.message);
            });
        });
    }
}
