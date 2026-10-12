function script({ api, event, helpers, imports }) {
    //setMapData script in getMapDataController; fired after event PROCESS_RESPONSE is emitted and getMap call returns
    let output = api.data.getMapDataBroker.output;
    var { rawData, messages, canManageSharedPreset } = output;

    var postFetch = {

        init: function () {
            this.processIncomingData();
            this.fireFetchCompleted();
        },

        processIncomingData: function () {
            //api.setState('errors', {}); //TODO: Add back after fixing mapDataFetchFailed flow.(STRY57881588 will address this)
            api.setState('rawData', rawData);
            var ciData = this.createCiData(rawData);
            api.setState('ciData', ciData);
            api.setState('profileData', rawData.ciProfileInfo);
            api.setState('messages', messages);
            api.setState('canManageSharedPreset', canManageSharedPreset);
        },

        createCiData: function (rawData) {
            // Since the getMapDataController only fires when the root node changes, existing data will be cleared.
            var ciData = {};
            // (NOTE: Progressive disclosure will have to be another data broker to fetch and merge the data).
            // (NOTE: extended props is not kept with this dataset).

            if (!rawData.ciNodeInfo) {
                return ciData;
            }

            Object.keys(rawData.ciNodeInfo).forEach((sysid) => {
                //merge incoming nodes to ciData; used when adding just a few new nodes
                ciData[sysid] = { ...rawData.ciNodeInfo[sysid] };

                //add style and direction to the connections (required for map)
                ciData[sysid].connections.forEach((c) => {
                    c.style = c.isReference ? 'dashed' : 'solid';
                    c.direction = c.isReference ? 'none' : 'original';
                });

                //report any duplicate connections for this node in ciData (rawData will still show the dups)
                ciData[sysid].connections.forEach((c, i, a) => {
                    let sameIndex = i === a.findIndex((c2) => c2.id === c.id);
                    if (!sameIndex) {
                        console.error('Unified Map: Duplicate connection found. (CI sysid="' + sysid + '" Connection id="' + c.id + '")');
                    }
                });
            });

            return ciData;
        },

        fireFetchCompleted: function () {
            helpers.timing.setTimeout(() => { //using setTimeout is a workaround for UXF bug where emit() is executed out of order before the setState calls above
                api.emit('SN_UNIFIED_MAP_CTRL#MAP_DATA_FETCH_COMPLETED', { ciSysid: output.sysid });
            }, 0);
        }
    };

    postFetch.init();
}
