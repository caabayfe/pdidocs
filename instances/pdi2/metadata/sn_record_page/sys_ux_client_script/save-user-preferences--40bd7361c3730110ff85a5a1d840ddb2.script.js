/**
* @param {params} params
* @param {api} params.api
* @param {event} params.event
* @param {any} params.imports
* @param {helpers} params.helpers
*/
function saveUserPreferences({
	api,
	event,
	helpers,
	imports
}) {
    let name = '';
    let value = '';
    if (event.payload.key === 'details_pane') {
        name = `workspace.layout.type.${api.context.props.inputTable}`;
        switch(event.payload.value) {
            case 'left':
                value = '0';
                break;
            case 'both':
                value = '1';
                break;
            case 'right':
                value = '2';
                break;
        }
    }
    if (name.length === 0)
        return;
	api.data.setSidebarRatioPreference.execute({
		name,value
	});
}
