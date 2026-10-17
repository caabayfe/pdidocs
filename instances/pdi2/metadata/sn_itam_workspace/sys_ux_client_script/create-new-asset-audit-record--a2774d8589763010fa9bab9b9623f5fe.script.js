function handler({
    api,
    event,
    imports
}) {
    const openRecord = function(table, sysID) {
        var redirectPayload = {
            redirect: true,
            route: 'record',
            fields: {
                sysId: sysID,
                table: table
            }
        };
        api.emit('NAV_ITEM_SELECTED', redirectPayload);
    };
    openRecord('sn_hamp_asset_audit', '-1');
}
