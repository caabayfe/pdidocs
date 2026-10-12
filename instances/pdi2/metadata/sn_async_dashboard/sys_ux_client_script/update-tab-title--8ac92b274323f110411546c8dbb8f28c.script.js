/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 */ 
function handler({api, event, helpers, imports}) {
    if (!api.context.props.listTitle)
        return;

    const setTabTitle = (title) => {
        api.emit('SCREEN_STATUS_CHANGED', { 
            'title': title
        });
    };

    switch (event.name) {
      case 'MACROPONENT_PROPERTY_CHANGED':
        if (event.payload.name === 'listTitle')
          setTabTitle(api.context.props.listTitle);
        break;
      case 'MACROPONENT_READY':
        setTabTitle(api.context.props.listTitle);
        break;
    }
}
