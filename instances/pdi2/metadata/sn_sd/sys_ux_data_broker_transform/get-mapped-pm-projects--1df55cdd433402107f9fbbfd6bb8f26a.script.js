function transform(input) {
    var output = {
        rows: []
    };

    var grContributingM2mPO = new GlideRecord("sn_sd_contributing_indicator_m2m_po_project");
    grContributingM2mPO.addNotNullQuery("po_project_id");
    grContributingM2mPO.addQuery("contributing_indicator_registry.service_group", input.serviceGroup);
    grContributingM2mPO.query();

    for (var i = 0; grContributingM2mPO.next(); i++) {
        output.rows[i] = {
            key: "",
            cells: {
                contributingIndicator: {},
                poProject: {},
                status: {},
                table: {},
                conditionApplied: {}
            }
        };

        output.rows[i].key = grContributingM2mPO.sys_id.toString();

        output.rows[i].cells.contributingIndicator = {
            "label": grContributingM2mPO.getValue("contributing_indicator_registry"),
            "value": grContributingM2mPO.getDisplayValue("contributing_indicator_registry")
        };

        output.rows[i].cells.poProject = {
            "label": grContributingM2mPO.getValue("po_project_id"),
            "value": grContributingM2mPO.getDisplayValue("po_project_id")
        };

        output.rows[i].cells.status = {
            "label": grContributingM2mPO.active ? gs.getMessage("Active") : gs.getMessage("Inactive"),
            "value": grContributingM2mPO.active ? gs.getMessage("Active") : gs.getMessage("Inactive"),
            "highlightedValue": {
                "color": grContributingM2mPO.active ? "positive" : "critical",
                "value": grContributingM2mPO.active ? gs.getMessage("Active") : gs.getMessage("Inactive"),
                "showIcon": true
            }
        };

        var grProminProjectEntity = new GlideRecord("promin_project_entity");
        grProminProjectEntity.addNullQuery("relation_type");
        grProminProjectEntity.addQuery("project", grContributingM2mPO.getValue("po_project_id"));
        grProminProjectEntity.query();

        if (grProminProjectEntity.next()) {
            output.rows[i].cells.table = {
                "label": grProminProjectEntity.getValue("table"),
                "value": grProminProjectEntity.getDisplayValue("table")
            };

            output.rows[i].cells.conditionApplied = {
                "label": grProminProjectEntity.getValue("filter"),
                "value": grProminProjectEntity.getDisplayValue("filter")
            };
        }
    }

    return output;
}
