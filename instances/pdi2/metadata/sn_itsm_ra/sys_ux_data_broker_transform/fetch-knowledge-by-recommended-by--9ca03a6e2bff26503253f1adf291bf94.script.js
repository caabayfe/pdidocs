function transform(inputs) {
    var recommendedBy = (inputs && inputs.recommendedBy) || "";
    var actionStatus = (inputs && inputs.actionStatus) || "";

    var knowledgeSysId = "";
    var number = "";

    if (actionStatus !== "completed") {
        return {
            success: false,
            message: "Skipped: action not completed",
            output: knowledgeSysId,
            number: number
        };
    }

    var gh = new GlideRecord("ga_guidance_history");
    gh.addQuery("recommended_by", recommendedBy);
    gh.addQuery("recommender", "sn_nb_action_detail");
    gh.orderByDesc("sys_created_on");
    gh.setLimit(1);
    gh.query();

    if (gh.next()) {
        var ghSysId = gh.getUniqueValue();

        var svv = new GlideRecord('sys_variable_value');
        svv.addQuery('document_key', ghSysId);
        svv.addQuery('variable', '7a44cabf3b976210d4acc5d643e45add');
        svv.addNotNullQuery('value');
        svv.orderByDesc('sys_updated_on');
        svv.setLimit(1);
        svv.query();

        if (svv.next()) {
            knowledgeSysId = svv.getValue("value") || "";
            if (knowledgeSysId) {
                var kb = new GlideRecord("kb_knowledge");
                if (kb.get(knowledgeSysId)) {
                    number = kb.getValue("number") || "";
                }
            }
        }
    } else {
        gs.info("No guidance history found for recommendedBy=" + recommendedBy);
    }

    return {
        success: true,
        message: "Retrieved knowledge id",
        output: knowledgeSysId,
        number: number
    };
}
