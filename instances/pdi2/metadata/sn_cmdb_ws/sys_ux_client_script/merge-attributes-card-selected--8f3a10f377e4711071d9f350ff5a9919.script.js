/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {

    let template = api.state.template; 
    let attributeLookup = api.state.attributeLookup;
    let allAttributes = api.state.allAttributes;
    let allAttributesCopy = allAttributes.map((x) => x);

    // remove any attributes that are already selected on the other cards
    if(api.state.selectedAttributeType != "newest_updated")
        allAttributesCopy = allAttributesCopy.filter((o) => (!template.newest_updated_merge_attributes.split(",").find(item => (item === o.id))));

    if(api.state.selectedAttributeType != "oldest_created")
        allAttributesCopy = allAttributesCopy.filter((o) => (!template.oldest_created_merge_attributes.split(",").find(item => (item === o.id))));

    if(api.state.selectedAttributeType != "most_relations")
        allAttributesCopy = allAttributesCopy.filter((o) => (!template.most_relations_merge_attributes.split(",").find(item => (item === o.id))));

    if(api.state.selectedAttributeType != "most_related_items")
        allAttributesCopy = allAttributesCopy.filter((o) => (!template.most_related_items_merge_attributes.split(",").find(item => (item === o.id))));
   
    // create correct format for list selector
    let available = {};
    for (let attribute of allAttributesCopy) {
        available[attribute.id] = {
            'label': attribute.label
        };
    }

    let selected = [];
    let selectedAttributeType = api.state.selectedAttributeType;
    let values = "";
    let assignAttributesHeader = "";

    switch (api.state.selectedAttributeType) {
        case "newest_updated":
            values = template.newest_updated_merge_attributes;
            assignAttributesHeader = await helpers.translate("Assigned attributes from latest updated CI");
            break;
        case "oldest_created":
            values = template.oldest_created_merge_attributes;
            assignAttributesHeader = await helpers.translate("Assigned attributes from oldest created CI");
            break;
        case "most_related_items":
            values = template.most_related_items_merge_attributes;
            assignAttributesHeader = await helpers.translate("Assigned attributes from CI with most related items");
            break;
        case "most_relations":
            values = template.most_relations_merge_attributes;
            assignAttributesHeader = await helpers.translate("Assigned attributes from CI with most relationships");
            break;
    }

    let valuesList = values ? values.split(',') : [];

    for (let item of valuesList) {
        selected.push([{
            'id': item,
            'label' : attributeLookup[item]
        }]);
    }
    
    if(selected.length == 0){
        api.setState('attributeListSelectorData',{
            "available" : available,
            "selected" : ""
        });
    }

    helpers.timing.setTimeout(() => {
            // need to use a setTimeout so that the setState above is not overwritten by this setState
            api.setState('attributeListSelectorData',{
                "available" : available,
                "selected" : selected
            });
    }, 100);

    let newest_updated_merge_attributes_count = template.newest_updated_merge_attributes ? template.newest_updated_merge_attributes.split(",").length : 0;
    let oldest_created_merge_attributes_count = template.oldest_created_merge_attributes ? template.oldest_created_merge_attributes.split(",").length : 0;
    let most_relations_merge_attributes_count = template.most_relations_merge_attributes ? template.most_relations_merge_attributes.split(",").length : 0;
    let most_related_items_merge_attributes_count = template.most_related_items_merge_attributes ? template.most_related_items_merge_attributes.split(",").length : 0;
    let totalAttributesUnassigned = api.state.totalAttributes - newest_updated_merge_attributes_count - oldest_created_merge_attributes_count - most_relations_merge_attributes_count - most_related_items_merge_attributes_count;  
    api.setState('totalAttributesUnassigned',totalAttributesUnassigned);
    api.setState('assignAttributesHeader',assignAttributesHeader);
    

}
