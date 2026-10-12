function script({ api, event, helpers, imports }) {
    //initializeLevels script in Map Search Filter UI Controller; fired after lookupSystemProps broker returns
    //fetches sys props for default and max levels
    // -max levels drives the dropdown content
    // -default levels is applied if uri missing levels param
    const { SYS_PROP, EVENTS } = imports['sn_cmdb_ws.unifiedMapUtilsMapSearchFilter']();
    var levelsContent;
    //assemble content for levels dropdown
    var maxLevels = parseInt(api.data.lookupSystemProps.output.properties[SYS_PROP.MAX_LEVEL]);
    var translations = [];
    translations.push(helpers.translate('1 level'));
    for(var i = 2; i <= maxLevels; i++) {
        translations.push(helpers.translate('{0} levels', i));
    }
    const r = /\d+/;
    Promise.all(translations).then((translated) => {
        levelsContent = translated.map((t) => {
            return {
                "id": parseInt(t.match(r)[0]),
                "label": t
            };
        });
        api.setState('levelsContent', levelsContent);
    });

    //now determine the selected level
    var levelsProp = parseInt(api.context.props.levels);
    var defaultLevels = parseInt(api.data.lookupSystemProps.output.properties[SYS_PROP.DEFAULT_LEVEL]);
    var selectedLevels = levelsProp;
    if (!levelsProp && levelsProp !== 0) {
        //should only ever come in here on page load with no params set (navigating in from the menu or home page)
        
        // this gets picked up by the levels dropdown
        selectedLevels = defaultLevels;
        
        //set it in the page's URL too
        api.emit('SN_UNIFIED_MAP_CTRL#UPDATE_PAGE_PROPS', {
            params: { levels: defaultLevels }
        });
    }


    if (selectedLevels > maxLevels) {
        selectedLevels = maxLevels;
    } else if (selectedLevels < 1) {
        selectedLevels = 1;
    }
    api.setState('selectedLevel', selectedLevels);

    helpers.timing.setTimeout(() => {
        api.emit(EVENTS.EVENT_SYNC, {
            originatingEvent: EVENTS.LEVELS_INITIALIZED,
            syncEvent: EVENTS.STATE_INITIALIZED,
            clearOnSync: true
        });
    }, 0);
}
