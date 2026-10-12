function onLoad() {
    if (!g_form.isNewRecord() && g_form.getValue("type") == "PARENT_ATTACHED" && g_form.getValue("attached_entity")) {
        g_form.setReadOnly("attached_entity", true);
    }
    if (!g_form.getReference("entity").parent_entity || g_form.getReference("entity").relation_type != "REFERENCE") {
        g_form.removeOption("type", "PARENT_ATTACHED");
    }
    var ga = new GlideAjax('ProminReferenceQualUtil');
    ga.addParam('sysparm_name', 'isChildAttachedApplicable');
    ga.addParam('sysparm_project_id', g_form.getReference("entity").project);
    ga.addParam('sysparm_entity_id', g_form.getValue("entity"));
    ga.getXML(isChildAttachedApplicable);

    function isChildAttachedApplicable(response) {
        if (response.responseXML.documentElement.getAttribute("answer") == 'false') {
            g_form.removeOption("type", "CHILD_ATTACHED");
        }
    }

    if (g_form.getReference("entity").source_type != "AGENTIC_AI_DATA") {
        var gaProminUtil = new GlideAjax('global.ProminUIActionClient');
        gaProminUtil.addParam('sysparm_name', 'isAuditEnabledTable');
        gaProminUtil.addParam('sysparm_table', g_form.getReference("entity").table);
        gaProminUtil.getXML(getIsAuditEnabledTableResponse);
    }

    function getIsAuditEnabledTableResponse(response) {
        var isAuditEnabled = response.responseXML.documentElement.getAttribute("answer");
        if (isAuditEnabled == "false") {
            if (g_form.isNewRecord()) {
                g_form.setValue("type", "DATE_TIME");
            }
            g_form.removeOption("type", "DEFAULT");
			g_form.removeOption("type", "COMPOUND");
			g_form.removeOption("type", "PARENT_ATTACHED");
			g_form.removeOption("type", "CHILD_ATTACHED");
        }
    }
}
