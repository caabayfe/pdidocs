/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    var numberLabel = helpers.translateSync("Number");
    var shortDescLabel = helpers.translateSync("Short Description");
    var descLabel = helpers.translateSync("Description");
    var closeNoteLabel = helpers.translateSync("Resolution Notes");
    return {
        "columns": [{
            "headerTextDisabled": true,
            "key": "number",
            "label": numberLabel,
            "metadata": {
                "excludedOperators": [],
                "internalType": "string",
                "isChoice": false,
                "isDescending": false,
                "isFilterable": true,
                "isFiltered": false,
                "isGroupable": true,
                "isSortable": true,
                "isSorted": true,
                "referenceDisplayName": null
            },
            "type": "link"
        }, {
            "headerTextDisabled": true,
            "key": "short_description",
            "label": shortDescLabel,
            "metadata": {
                "excludedOperators": [],
                "internalType": "string",
                "isChoice": false,
                "isFilterable": true,
                "isFiltered": false,
                "isGroupable": true,
                "isSortable": true,
                "referenceDisplayName": null
            },
            "type": "string"
        }, {
            "headerTextDisabled": true,
            "key": "description",
            "label": descLabel,
            "metadata": {
                "excludedOperators": [],
                "internalType": "string",
                "isChoice": false,
                "isFilterable": true,
                "isFiltered": false,
                "isGroupable": false,
                "isSortable": true,
                "referenceDisplayName": null
            },
            "type": "string"
        }, {
            "headerTextDisabled": true,
            "key": "close_notes",
            "label": closeNoteLabel,
            "metadata": {
                "excludedOperators": [],
                "internalType": "string",
                "isChoice": false,
                "isFilterable": true,
                "isFiltered": false,
                "isGroupable": false,
                "isSortable": false,
                "referenceDisplayName": null
            },
            "type": "string"
        }]
    };
}
