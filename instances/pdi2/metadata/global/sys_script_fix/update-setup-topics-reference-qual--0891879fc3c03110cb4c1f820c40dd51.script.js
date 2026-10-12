executeFix();

function executeFix() {
    var templates = [{
            tableName: "sys_cs_context_profile_topic",
            columnName: "topic",
            referenceQualValue: "javascript:new global.CsContextProfile().filterSetupTopics()"
        },
        {
            tableName: "sys_cs_context_profile_promotion",
            columnName: "topic",
            referenceQualValue: "javascript:new global.CsContextProfile().filterPromotedTopics()"
        }
    ];

    templates.forEach(function(template) {
        var gr = new GlideRecord("sys_dictionary");
        gr.addQuery("name", template.tableName);
        gr.addQuery("element", template.columnName);
        gr.query();
        if (gr.next()) {
            gr.setValue(
                "reference_qual",
                template.referenceQualValue
            );
            gr.update();
        }
    });

}
