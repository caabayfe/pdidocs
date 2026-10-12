function transform(input) {
    let studioAppNamespace;

    try {
        // TODO: Remove the below code once DEF0589428 is fixed
        const studioShellConfig = input?.studioAppNamespace ? JSON.parse(input.studioAppNamespace) : null;
        studioAppNamespace = studioShellConfig?.studioAppNamespace;
    } catch (error) {
        gs.error(`Error parsing studioAppNamespace: ${error.message}`);
        return {};
    }

    if (!studioAppNamespace) {
        return {};
    }

    const user = gs.getUser();
    const userSysId = user.getID();

    const preferences = [{
            name: 'scope.based.tab.grouping.enabled',
            preferenceKey: `${studioAppNamespace}.scope.based.tab.grouping.enabled`,
            defaultValue: null,
        },
        {
            name: 'recentSearches',
            preferenceKey: `${studioAppNamespace}.${userSysId}.recentSearches`,
            defaultValue: [],
            transformPreferenceValue: (key, value) => UDCUtil.removeOldRecentSearches(key, value)
        },
        {
            name: 'themeVariant',
            preferenceKey: 'glide.ui.udc.theme.variant',
            defaultValue: null,
        },
        {
            name: 'showFileParentCategories',
            preferenceKey: `${studioAppNamespace}.${userSysId}.showFileParentCategories`,
            defaultValue: true
        },
        {
            // Note: This name must match COLLECTIONS_WELCOME_DISMISSED_PREFERENCE in collectionsPane.constants.js
            name: 'collectionsWelcomeDismissed',
            preferenceKey: `${studioAppNamespace}.${userSysId}.collectionsWelcomeDismissed`,
            defaultValue: null
        },
    ];

    const userPreferences = preferences.reduce((acc, {
        preferenceKey,
        defaultValue,
        transformPreferenceValue
    }) => {
        let preferenceValue = user.getPreference(preferenceKey); // Fetch the preference first

        if (typeof transformPreferenceValue === 'function')
            preferenceValue = transformPreferenceValue(preferenceKey, preferenceValue);

        acc[preferenceKey] = preferenceValue != null ? preferenceValue : defaultValue;
        return acc;
    }, {});

    return {
        userPreferences
    };
}
