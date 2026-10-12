function handler({
					 api,
					 event,
					 imports,
					 helpers
				 }) {
	const { name, payload: { route, fields, params = {}, size = 'md' }} = event;

	if (name === 'RECORD#CLOSE_MODAL')
		helpers.modal.close();

	else if (name === 'RECORD#OPEN_MODAL') {
		if (!route)
			return;

		api.setState('bare', true);
		api.setState('displayOptions', {
			size: size,
			label: params.label
		});
		api.setState('contents', {
			route: route,
			fields: fields,
			params: params
		});
	}
}
