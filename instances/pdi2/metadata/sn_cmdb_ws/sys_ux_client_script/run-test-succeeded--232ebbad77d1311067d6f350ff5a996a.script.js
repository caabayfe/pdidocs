/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {

    let results = event.payload.data.output;
    let allTranslation =  await helpers.translate("All");
    let previewData = {
        "numbers": {
            "mainCI" : results.master_ci_info.name,
            "mainCI_url" : results.master_ci_info.url,
            "relationship" : results.relationships_merged,
            "mergeRelations" : results.mergeRelations ? await helpers.translate("All") : "0",
            "related" : results.related_tables_merged_count,
            "deleteActionCount" : results.deleted_cis_count ? results.deleted_cis_count : results.updated_cis_count
        },
        "tables": {
            "attributes" : {"columns" : [],"rows": []},
            "related" : {"columns" : [],"rows": []},
            "duplicate" : {"columns" : [],"rows": []},
            "updated": {"columns" : [],"rows": []}
        }
    };

    // Create Attributes table
    previewData.tables.attributes.columns.push({"key": "col1","label": await helpers.translate("Attributes"),"type": "string"});
    previewData.tables.attributes.columns.push({"key": "col2","label": await helpers.translate("Duplicate CIs"),"type": "url","opensInNew" : true});
    results.attributesMap.forEach((item,index) => {
        let attribute = api.state.attributeLookup[item.element] ? api.state.attributeLookup[item.element] : item.element
        previewData.tables.attributes.rows.push({"cells" : {"col1": {"value": attribute},"col2": {"value": item.url , "label" : item.value}},"key": "rowKey" + index});
    });
    
    // Create Related Items table 
    previewData.tables.related.columns.push({"key": "col1","label": await helpers.translate("Name"),"type": "string"});
    results.related_tables_merged.forEach((item,index) => {
       let value = api.state.allRelatedItems[item] ? api.state.allRelatedItems[item] : item;
       previewData.tables.related.rows.push({"cells" : {"col1": {"value": value}},"key": "rowKey" + index});
    });

    // Create Duplicate CI table
    previewData.tables.duplicate.columns.push({"key": "col1","label": await helpers.translate("Duplicate"),"type": "url","opensInNew" : true});
    results.duplicate_ci_info_list.forEach((item,index) => {
       previewData.tables.duplicate.rows.push({"cells" : {"col1": {"value": item.url,"label" : item.name}},"key": "rowKey" + index});
    });

    // Create updates CI table
    previewData.tables.updated.columns.push({"key": "col1","label": await helpers.translate("Attribute"),"type": "string"});
    previewData.tables.updated.columns.push({"key": "col2","label": "Value","type": "string"});
    results.duplicate_ci_updates_info.forEach((item,index) => {
        previewData.tables.updated.rows.push({"cells" : {"col1": {"value": item.element_label},"col2": {"value": item.element_value}},"key": "rowKey" + index});
    });

    if(api.state.display_preview_timeout > 1)
        helpers.timing.clearTimeout(api.state.display_preview_timeout);

    api.setState('display_preview_delay_warning', false);
    api.setState('showTestResults', true);
    api.setState('testResults', previewData);
    api.setState('testResultsExpanded', true);
    api.setState('testTaskSelectionExpanded', false);
    api.setState('defaultState_reviewTestResultsHidden', false);
    

}
