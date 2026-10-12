function script({ api, event, helpers, imports }) {
    //saveUserPref script in Map Search Filter UI Controller; fired after UI interaction that being tracked as a user pref (eg. showFilteredItems)
    const { saveUserPref } = imports['sn_cmdb_ws.unifiedMapUtilsMapSearchFilter']();
    saveUserPref(event.payload.key, event.payload.value, api);
}
