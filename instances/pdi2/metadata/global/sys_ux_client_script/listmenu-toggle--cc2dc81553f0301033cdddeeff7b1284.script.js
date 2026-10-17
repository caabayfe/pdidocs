/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 */
function handler({api, event, helpers, imports}) {
    const listPreference = api.state.listMenuOpenPreference;
    const open = event.payload.listMenuOpen;

    api.setState('listMenuOpen', open);
    api.setState('listDisplayPanes', open? 'both': 'right');
 
    api.data.setListPreference.execute({
        'name': listPreference,
        'value': open
    });    
}
