/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {
    let pageInput = api.state.pageInput;
    let disableContinue = { ...api.state.disableContinue };
    if (event.elementId === "setupName") {
        pageInput.name = event.payload.fieldValue;
        disableContinue['basic'] = !(pageInput.name && pageInput.description);
        api.setState('disableContinue', disableContinue);
    } else if (event.elementId === "setupDescription") {
        pageInput.description = event.payload.fieldValue.trim();
        disableContinue['basic'] = !(pageInput.name && pageInput.description);
        api.setState('disableContinue', disableContinue);
    } else if (event.elementId === "setupRoles") {
        if (event.name === "NOW_TYPEAHEAD_MULTI#VALUE_SET") {
            api.setState('roleFilter', event.payload.value);
            api.data.get_all_roles.refresh();
        } else if (event.name === "NOW_TYPEAHEAD_MULTI#SELECTED_ITEMS_SET") {
            pageInput.roles = event.payload.value.map(role => role.label).join();
            disableContinue['basic'] = !(pageInput.name && pageInput.description);
            api.setState('disableContinue', disableContinue);
        }
    } else if (event.elementId === "setup_execution_type") {
        pageInput.setup_execution_type = event.payload.item.id;
    } else if (event.elementId == "skip_execution_page") {
        pageInput.skip_execution_page = event.payload.value;
    } else if (event.elementId == "setup_layout") {
        pageInput.setup_layout = event.payload.item.id;
    }
    api.setState('pageInput', pageInput);
    return;
}
