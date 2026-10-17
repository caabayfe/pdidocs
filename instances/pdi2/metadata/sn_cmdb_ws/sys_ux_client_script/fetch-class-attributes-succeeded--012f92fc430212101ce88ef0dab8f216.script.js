/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const {
    templateTable
    } = api.context.props;
        let result = event.payload?.data?.output?.result;
        let allAttributes = [];
    
        for (let attribute of result) {
            allAttributes.push({
                'id': attribute.name,
                'label': attribute.label
            });
        }
    
        allAttributes.sort((a, b) => (a.label > b.label) ? 1 : -1);
        api.setState('allAttributes',allAttributes);
    
        api.data.de_duplication_template_get_related_items.execute({
            'class': templateTable
        });
    }
