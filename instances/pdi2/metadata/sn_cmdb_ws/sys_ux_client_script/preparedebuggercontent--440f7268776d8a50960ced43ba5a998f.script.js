function script({ api, event, helpers, imports }) {
    //prepareDebuggerContent in mapSearchFilter controller; triggered upon search CI typeahead matching show_basic_debugger
    var content = {
        props: {},
        state: {},
        getMapDataController: {
            ciData: {},
            errors: null,
            profileData: {},
            canManageSharedPreset: false,
            rawData: {},
            messages: null
        }
    };

    var debug = {
        init: function () {
            this.prepareDebugContent();
            this.render();
        },

        prepareDebugContent: function () {
            //mapSearchFilter context/input props (may not be from URL)
            Object.keys(api.context.props)
                //exclude prop noise that's not ours
                .filter(o => (event.payload.searchText && event.payload.searchText === 'show_advanced_debugger' ? true : !o.toLowerCase().includes("nowuxf")))
                .sort().reduce(function (acc, p) {
                    acc.props[p] = api.context.props[p];
                    return acc;
                }, content);

            //mapSearchFilter state
            Object.keys(api.state)
                .filter(o => !o.includes("debuggerContent"))
                .sort().reduce(function (acc, o) {
                    content.state[o] = api.state[o];
                    return acc;
                }, content);

            //getMapDataController ciData
            Object.keys(api.data.getMapDataController.ciData)
                .sort().reduce(function (acc, o) {
                    content.getMapDataController.ciData[o] = api.data.getMapDataController.ciData[o];
                    return acc;
                }, content);

            //getMapDataController errors
            content.getMapDataController.errors = api.data.getMapDataController.errors;

            //getMapDataController profileData
            content.getMapDataController.profileData = api.data.getMapDataController.profileData;

            //getMapDataController rawData
            Object.keys(api.data.getMapDataController.rawData)
                .sort().reduce(function (acc, o) {
                    content.getMapDataController.rawData[o] = api.data.getMapDataController.rawData[o];
                    return acc;
                }, content);

            //getMapDataController messages
            content.getMapDataController.messages = api.data.getMapDataController.messages;

            //getMapDataController canManageSharedPreset
            content.getMapDataController.canManageSharedPreset = api.data.getMapDataController.canManageSharedPreset;
        },

        render: function () {
            api.setState('debuggerContent', JSON.stringify(content, null, 4));
        }
    };

    debug.init();
}
