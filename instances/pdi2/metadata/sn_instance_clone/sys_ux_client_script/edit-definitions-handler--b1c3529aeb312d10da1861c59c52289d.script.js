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
        case 'clone_get_list_header_1':
            api.setState('available', api.data.clone_get_list_header_1.output.definitions);
            api.setState('selected', api.data.clone_get_list_header_1.output.selected);
            api.setState('showPreserverWarning',api.data.clone_get_list_header_1.output.showWarning.warn);
            api.setState('warningMessages',api.data.clone_get_list_header_1.output.showWarning.messages);
            break;
        case 'reset':
            api.data.clone_get_list_header_1.refresh();
            api.setState('available', api.data.clone_get_list_header_1.output.definitions);
            api.setState('selected', api.data.clone_get_list_header_1.output.selected);
            break;
        case 'list_selector_2':
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
                    operation: 'CREATE_DEFINITIONS',
                    table: api.context.props.table,
                    filter: api.context.props.fixedFilter,
                    items: api.state.finalItems
                }
            }).then(response => {
                helpers.modal.close('edit_definitions_modal');
                api.setState('timestamp',Date.now());
            }).catch(response => {
                try {
                    console.log("CREATE_DEFINITIONS failed: " + JSON.stringify(response.error));
                } catch (e) {
                    console.log("CREATE_DEFINITIONS failed: " + JSON.stringify(response));
                }
            });
            break;
        case 'cancel':
            helpers.modal.close('edit_definitions_modal');
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
