async function handler({api, event, helpers, imports}) {
    const translatedTitle = await helpers.translate('BAW:Search results');
    helpers.screen.updateStatus({title: translatedTitle});
}
