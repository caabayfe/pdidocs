function script({ api, event, helpers, imports }) {
    //setEditModePermissions script in Get Map Data Controller; handler for sn_uxf.DATA_FETCH_SUCCEEDED event
    let output = api.data.getMapDataBroker.output;
    var { allowEditMode } = output;

    var postFetch = {

        init: function () {
            this.processEditModePermissions();
        },

        processEditModePermissions: function () {

            api.setState('allowEditMode', allowEditMode);
            var editModeEnabled = (api.context.props.editMode && (api.context.props.editMode === true || api.context.props.editMode === "true"));

            if (editModeEnabled && allowEditMode) {
                api.emit('SN_UNIFIED_MAP_CTRL#REQUEST_TO_UPDATE_PAGE_PROPS', { params: { editMode: "true" } });
            }
            else {
                api.emit('SN_UNIFIED_MAP_CTRL#REQUEST_TO_UPDATE_PAGE_PROPS', { params: { editMode: "false" } });
            }

            var rawData = api.data.getMapDataBroker.output?.rawData;
            if(!!rawData && Object.keys(rawData).length > 0) {
                var mapType = rawData.mapType;
                api.emit('SN_UNIFIED_MAP_CTRL#SET_STATE_BY_MAP_TYPE', { mapType: mapType } );
            }
        }
    }

    postFetch.init();
}
