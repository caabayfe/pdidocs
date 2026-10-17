/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
async function handler({
    api,
    event,
    helpers,
    imports
}) {
    let data = api.data.multisource_data_preview.output?.result?.reconciliationpreviewdata;
    if (!data)
        return;

    const CMDB_COL_KEY = "cmdb";
    const CMDB_COL_LABEL = await helpers.translate("CMDB Value");
    const ATTR_NAME_COL_KEY = "attribute";
    const ATTR_NAME_COL_LABEL = await helpers.translate("Attribute");

    let dataSources = [
        getSourceObject(ATTR_NAME_COL_LABEL, ATTR_NAME_COL_KEY),
        getSourceObject(CMDB_COL_LABEL, CMDB_COL_KEY)
    ];
    let attributes = [];
    
    data.forEach(function(previewData) {
        let newAttribute = getAttributeObject(previewData.attribute, previewData.attribute_label, previewData.golden_value);

        if (previewData.multi_source_values) {
            previewData.multi_source_values.forEach(function(source) {
                // save source/column if not already saved
                if (!dataSources.find(src => source.discovery_source === src.label)) {
                    dataSources.push(getSourceObject(source.discovery_source, source.discovery_source));
                }

                newAttribute.cells[source.discovery_source] = {
                    "value": source.value,
                    "label": source.value
                };
            });
        }
        attributes.push(newAttribute);
    });

    let cmdbPreviewData = {...api.state.cmdbPreviewData};
    cmdbPreviewData.columns = {
        "columns": dataSources,
        "columnHeaderTextTooltip": await helpers.translate("Click to sort")
    };
    cmdbPreviewData.rows = {"rows": attributes};
    cmdbPreviewData.totalRows = attributes.length;
    cmdbPreviewData.currPageNumber = 0;

    const pageNum = 0;
    const pageSize = cmdbPreviewData.pageSize;
    const begin = pageNum * pageSize;
    const end = begin + pageSize;
    cmdbPreviewData.currPageRows = {"rows": attributes.slice(begin, end)};

    api.setState("cmdbPreviewData", cmdbPreviewData);


    // Functions
    function getSourceObject(label, key) {
        return {
            "key": key,
            "label": label,
            "type": "string",
            "metadata": {
                "isFilterable": true,
                "isSortable": true,
                "internalType": "string",
            },
            "icons": {},
            "sortDirection": "none"
        }
    }

    function getAttributeObject(key, attrLabel, goldenValue) {
        return {
            "key": key,
            "type": "default",
            "cells": {
                [ATTR_NAME_COL_KEY]: {
                    "value": attrLabel,
                    "label": attrLabel
                },
                [CMDB_COL_KEY]: {
                    "value": goldenValue,
                    "label": goldenValue
                }
            }
        };
    }
}
