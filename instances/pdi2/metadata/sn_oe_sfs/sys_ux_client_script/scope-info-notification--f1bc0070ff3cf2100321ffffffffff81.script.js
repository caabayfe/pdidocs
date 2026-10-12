function handler({ api, event, helpers, imports }) {
    const userPreferences = api.context?.session?.user?.preferences;

    if (!userPreferences || !Array.isArray(userPreferences)) {
    console.warn("No user preferences found.");
    return;
    }

    const recentItemsPref = userPreferences.find(pref => 
    pref.name === 'glide.ui.concourse_picker.recent_items'
    );

    if (!recentItemsPref?.value) {
    console.warn("No recent application(s) found in user preferences.");
    return;
    }

    let appName = null;

    try {
    const parsed = JSON.parse(recentItemsPref.value);
    appName = parsed.application?.[0]?.name; // most recent
    } catch (e) {
    console.error("Failed to parse application:", e);
    }

    if (appName) {
    api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
        items: [{
        id: 'scope-alert',
        status: 'info',
        icon: 'info-circle-outline',
        content: `[${appName}] is your current application scope. Please ensure you are in the scope of this specific integration or Global in order to configure certain preferences in the Settings tab below.`,
        action: {
            type: 'dismiss'
        }
        }]
    });
    } else {
    console.warn("App name not found in parsed recent items.");
    }
}
