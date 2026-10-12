/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    
    if(api.context.props.template) {
        // template object passed. Set to state.template
        api.setState('template',api.context.props.template);

        // initiate fetching merged attributes for this class
        api.data.deduplication_get_merged_attributes_1.execute({
            'class': api.context.props.template.table
        });
        api.data.deduplication_template_get_related_items_1.execute({
            'class': api.context.props.template.table
        });
    } else {
        api.data.deduplication_template_get_1.execute({
            'templateSysId': api.context.props.templateSysId
        });

        // only display the loading indicator when a new template is selected. this prevents screen flashing.
        if(api.context.props.templateSysId != api.state.templateSysId)
            api.setState('loading',true);

        api.setState('templateSysId',api.context.props.templateSysId);
    }

    // refresh all libraries. 
    api.data.deduplication_template_get_all_libraries_1.refresh();
    
}
