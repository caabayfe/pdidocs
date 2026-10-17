/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const prefs  = api.data.look_up_user_preferences_1.result.preferences;
    const activity = api.state.activity || '';
    // ── Layout preference (index 0 — unchanged) ────────────────────
    if (prefs[0].value)
        api.setState("defaultLayout", prefs[0].value);
    // ── Column preference — activity-specific ──────────────────────
    const prefKey     = (activity === 'overview') ? 'clone_home_overview_columns' : 'clone_home_list_columns';
    const savedColPref = prefs.find(p => p.name === prefKey);
    if (savedColPref && savedColPref.value) {
        // Use saved preference for this view
        api.setState("return_fields", savedColPref.value);
    } else {
        // No saved pref yet — use client state param default for this view
        const defaultFields = (activity === 'overview')
            ? api.state.overviewPage_return_fields
            : api.state.activityPage_return_fields;
        api.setState("return_fields", defaultFields);
    }
    const isGrid = api.state.defaultLayout === "grid";
    const isList = api.state.defaultLayout === "list";
    api.setState("ariaPropsgrid", { "aria-label": "Grid view",  "aria-pressed": isGrid.toString(), "role": "button" });
    api.setState("ariaPropslist",  { "aria-label": "List view",  "aria-pressed": isList.toString(), "role": "button" });
}
