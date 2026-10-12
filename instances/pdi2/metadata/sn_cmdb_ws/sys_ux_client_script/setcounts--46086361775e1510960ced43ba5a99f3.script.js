function script({ api, event, helpers, imports }) {
    //setCounts script in Related Items controller; event fired upon return of Get Related Item Counts data broker
    //NOTE: this fetch will always return counts for all related tables since we're only using the counts on the aggregate view
    const { getHash } = imports["sn_cmdb_ws.unifiedMapUtils"]();

    //exit if there's any errors
    var output = api.data.get_related_item_counts.output;
    if (output.errors.length) {
        console.error('Errors encountered fetching data from get_related_item_counts data broker: ' + output.errors.join('. '));
        return;
    }

    let totalCounts = output.counts.reduce((total, count) => total + count.value.value, 0);
    api.setState('counts', output.counts);
    api.setState('totalCounts', totalCounts);

    //now save it
    let cache = api.state.cache;
    const sysids = output.sysids;
    const sysidOrHash = getHash(sysids);

    if (cache.sysidOrHash) { //does CI sysid (or hash of CIs) exist in cache?
        output.counts.forEach((item) => {
            if (!cache[sysidOrHash][item.sysId]) { //does the tableQuery exist for this sysid?
                cache[sysidOrHash][item.sysId] = {};
                cache[sysidOrHash][item.sysId].count = item; //add this table query result for this CI or hash of CIs
            } else if (!cache[sysidOrHash][item.sysId].count) {
                //add this table-query result for this CI (or hash of CIs) if not already added
                cache[sysidOrHash][item.sysId].count = item;
            }
        });
    } else { //create an entry for this CI and add each table-query result to it
        cache[sysidOrHash] = {};
        output.counts.forEach((item) => {
            cache[sysidOrHash][item.sysId] = {};
            cache[sysidOrHash][item.sysId].count = item;
        });
    }

    // api.setState('cache', JSON.parse(JSON.stringify(cache))); //the stringify and parse are very expensive given it's size; not needed until we add handlers watching it
    api.setState('cache', cache);
}
