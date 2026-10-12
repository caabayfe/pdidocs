/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 */
function handler({api, event, helpers, imports}) {
    if((!api.data.fetch_related_record_defintions_1.output || !api.data.fetch_related_record_defintions_1.output[0])) {
        api.setState("selectedId", null);
        api.setState("selectedFilter", null);
        api.setState("selectedTable", null);
        api.setState("searchDisabled", true);
        api.setState("selectedLabel", null);
        api.setState("canCreate", false);
        api.setState("searchString", "");
        return;
    }

    api.setState("selectedId", api.data.fetch_related_record_defintions_1.output[0].id);
    api.setState("selectedFilter", api.data.fetch_related_record_defintions_1.output[0].filter);
    api.setState("selectedTable", api.data.fetch_related_record_defintions_1.output[0].table);
    api.setState("selectedLabel", api.data.fetch_related_record_defintions_1.output[0].label);
    api.setState("canCreate", api.data.fetch_related_record_defintions_1.output[0].canCreate);
    api.setState("searchString", "");

   //initalize searchDisabled
    api.data.has_text_index_1.execute({
        "table":api.data.fetch_related_record_defintions_1.output[0].table
    });
   
}
