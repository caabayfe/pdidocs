/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  return {
    "columns": [
        {
            "key": "name",
            "label": helpers.translateSync("Finding definition name"),
            "metadata": {
                "isFilterable": true,
                "isGroupable": true,
                "isSortable": true
            }
        },
        {
            "key": "type",
            "label": helpers.translateSync("Type"),
            "metadata": {
                "isFilterable": true,
                "isGroupable": true,
                "isSortable": true
            },
            "width": "200px",
        },
        {
            "key": "category",
            "label": helpers.translateSync("Category"),
            "metadata": {
                "isFilterable": true,
                "isGroupable": true,
                "isSortable": true
            },
            "type": "string"
        },
        {
            "key": "impacted_kpis",
            "label": helpers.translateSync("Impacted KPI(s)"),
            "metadata": {
                "isFilterable": true,
                "isGroupable": true,
                "isSortable": true
            },
            "type": "string"
        },
        {
            "key": "sys_updated_on",
            "label": helpers.translateSync("Updated on"),
            "metadata": {
                "isFilterable": true,
                "isGroupable": false,
                "isSortable": true
            },
            "type": "string"
        },
        {
            "key": "sys_updated_by",
            "label": helpers.translateSync("Updated by"),
            "metadata": {
                "isFilterable": true,
                "isGroupable": true,
                "isSortable": true
            },
            "type": "string"
        }
    ]
};
}
