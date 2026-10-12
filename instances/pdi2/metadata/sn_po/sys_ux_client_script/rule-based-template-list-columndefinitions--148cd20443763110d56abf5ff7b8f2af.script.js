/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
    return {
    "columnHeaderTextTooltip": helpers.translateSync("Sort"),
    "columns": [
        {
            "key": "message",
            "label": helpers.translateSync("Message"),
            "metadata": {
                "isFilterable": true,
                "isGroupable": true,
                "isSortable": true
            },
      "cellActions": [
                {
                    "action": "LIST_CTRL#SHOW_MATCHING_CLICKED",
                    "id": "show_matching",
                    "label": helpers.translateSync("Show Matching")
                },
                {
                    "action": "LIST_CTRL#FILTER_OUT_CLICKED",
                    "id": "filter_out",
                    "label": helpers.translateSync("Filter Out")
                }
            ],
        },
        {
            "key": "subcategory",
            "label": helpers.translateSync("Type"),
            "metadata": {
                "isFilterable": true,
                "isGroupable": true,
                "isSortable": true
            },
      "cellActions": [
                {
                    "action": "LIST_CTRL#SHOW_MATCHING_CLICKED",
                    "id": "show_matching",
                    "label": helpers.translateSync("Show Matching")
                },
                {
                    "action": "LIST_CTRL#FILTER_OUT_CLICKED",
                    "id": "filter_out",
                    "label": helpers.translateSync("Filter Out")
                }
            ],
            "type": "string"
        },
    ]
};
}
