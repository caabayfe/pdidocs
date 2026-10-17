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
    let roles = api.data.get_all_roles.results;
    let allRoles = roles.map((role) => {
        return {
            id: role.name.value,
            label: role.name.displayValue
        };
    });
    api.setState('allRoles', allRoles);
    return;
}
