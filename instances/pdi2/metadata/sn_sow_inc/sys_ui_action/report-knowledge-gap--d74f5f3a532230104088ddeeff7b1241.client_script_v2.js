function onClick(g_form) {
    getMessages(["Topic", "Description", "Report a knowledge gap", "Cancel", "Submit"], openModal);
    function openModal(translatedMsgs){
        var fields = [{
            type: 'string',
            name: 'topic',
            label: translatedMsgs["Topic"],
            mandatory: true,
            value: g_form.getValue('short_description')
        }, {
            type: 'textarea',
            name: 'description',
            label: translatedMsgs["Description"]
        }];

        g_modal.showFields({
            title: translatedMsgs["Report a knowledge gap"],
            fields: fields,
            cancelTitle: translatedMsgs["Cancel"],
            confirmTitle: translatedMsgs["Submit"],
            cancelType: "default",
            size: "md",
            resizableConfig : {
                enableResizable: true,
                resizableMinWidth: 420,
                resizableMinHeight: 133
            },
            confirmType: "confirm"
        }).then(function(fieldValues) {
            var incknowledgeUtil = new GlideAjax("sn_sow_inc.SOWIncidentUtilsAjax");
            incknowledgeUtil.addParam("sysparm_name", "createKnowledgeGap");
            incknowledgeUtil.addParam("sysparm_incident", g_form.getUniqueValue());
            incknowledgeUtil.addParam("topic", fieldValues["updatedFields"][0].value);
            incknowledgeUtil.addParam("description", fieldValues["updatedFields"][1].value);
            incknowledgeUtil.getXMLAnswer(function(answer){
                if(answer) g_form.addInfoMessage(answer);
            });
        });
    }
}
