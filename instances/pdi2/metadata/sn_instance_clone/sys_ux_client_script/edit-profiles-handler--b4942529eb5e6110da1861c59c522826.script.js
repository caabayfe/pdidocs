/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {
    switch (event.elementId) {
        case 'get_profiles_for_definition':
            api.setState('available', api.data.get_profiles_for_definition.output.available);
            api.setState('selected', api.data.get_profiles_for_definition.output.selected);
            break;
        case 'reset':
            api.data.get_profiles_for_definition.refresh();
            api.setState('available', api.data.get_profiles_for_definition.output.available);
            api.setState('selected', api.data.get_profiles_for_definition.output.selected);
            break;
        case 'list_selector_1':
            var currentItems = api.state.selected.map(getItems);
            var newItems = event.payload.map(getItems);
            var haveToCreate = getHaveToCreateItems(currentItems, newItems);
            var haveToDelete = getHaveToDeleteItems(currentItems, newItems);
            api.setState('finalItems', {
                haveToCreate: haveToCreate,
                haveToDelete: haveToDelete
            });
            break;
        case 'save':
            helpers.snHttp('/api/sn_instance_clone/clone/util', {
                method: 'POST',
                body: {
                    operation: 'CREATE_PROFILES',
                    table: api.context.props.table,
                    sysId: api.state.sysId,
                    items: api.state.finalItems
                }
            }).then(response => {
                helpers.modal.close('edit_profile_modal');
                api.setState('timestamp',Date.now());
            }).catch(response => {
                try {
                    console.log("CREATE_PROFILES failed: " + JSON.stringify(response.error));
                } catch (e) {
                    console.log("CREATE_PROFILES failed: " + JSON.stringify(response));
                }
            });
            break;
        case 'cancel':
            helpers.modal.close('edit_profile_modal');
            break;
        default:
    }

    function getItems(value) {
        return value[0].id;
    }

    function getHaveToCreateItems(currentItems, newItems) {
        return newItems.filter((x) => !currentItems.includes(x));
    }

    function getHaveToDeleteItems(currentItems, newItems) {
        return currentItems.filter((x) => !newItems.includes(x));
    }

}
