function handler({api, event, helpers, imports}) {
        helpers.navigate.to('data-manager-add-to-exclusion', null,
                        {
                                "ts": Date.now()
                        },
                        null, null, 'current');
}
