function script({ api, event, helpers, imports }) {
    /* relatedItemSysidsPropChanged script in Related Items UI Controller; fired after selected nodes on map change.
     * The purpose of this script is to check cache before setting client state and firing off brokers
     * NOTE: for counts and records representing more than one node, a hash is used on the 
     * combination of all the sysids for the CIs as the key instead of any sysid. */
    const { getHash } = imports["sn_cmdb_ws.unifiedMapUtils"]();
    const sysids = api.context.props.relatedItemSysids;
    const sysidOrHash = getHash(sysids);

    let cache = api.state.cache;
    var output = api.data.get_related_lists.output;
    var relatedLists = output?.relatedLists.original;
    if (sysidOrHash && sysidOrHash in cache) {
        // check if cached counts exist for all related table-queries
        var tableQueryNames = Object.keys(cache[sysidOrHash]);
        let allCountsExist = relatedLists.every((list) => {
            return tableQueryNames.includes(list.sys_id) && 'count' in cache[sysidOrHash][list.sys_id];
        });
        // use the cache value
        if (allCountsExist) {
            let counts = Object.keys(cache[sysidOrHash]).map((sys_id) => {
                return cache[sysidOrHash][sys_id].count;
            });
            api.setState('counts', counts);
            let totalCounts = counts.reduce((total, count) => total + count.value.value, 0);
            api.setState('totalCounts', totalCounts);
        }
    } else {
        api.setState('sysidsForCounts', sysids);
    }
    api.setState('allSelectComponentData', output?.relatedLists.allSelectComponentData);
    api.setState("showDetailView", false);
    api.setState("relatedItemHeading", "");
    api.setState('relatedItemRecords', []);
    api.setState("relatedItemCategorySysId", "");
}
