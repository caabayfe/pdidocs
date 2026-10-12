function script({ api, event, helpers, imports }) {
    //applyPreset script in Map Search Filter UI Controller; fired after the preset is changed
    const { applyPreset } = imports['sn_cmdb_ws.unifiedMapUtilsMapSearchFilter']();

    applyPreset({ preset: event.payload.items[0], api, helpers });
}
