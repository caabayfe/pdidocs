/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({ api, event, helpers, imports }) {

    const eventName = event.name;
    let RLConfig = api.data.related_list_configuration.output;
    let RLData = api.data.record.relatedLists;

    if (!RLConfig || !RLData || RLData.length == 0) {
        return;
    }

    const getRLTabs = () => {
        const result = [];
        RLConfig.forEach((rlConfig) => {
            let rlTab = {};
            rlTab.label = rlConfig.label;
            rlTab.id = rlConfig.id;
            rlTab.selectedTabIndex = api.context.props.selectedTabIndex;
            rlTab.relatedListsData = filterRL(rlConfig);
            if (rlTab.relatedListsData && rlTab.relatedListsData.length > 0){
                // added extra logic to select specific related list (needed by ITOM)
                const paramsString = api.context.props.extraParams;
                const paramsObj = paramsString?.split('/');
                if (paramsObj && paramsObj.length){
                    const i = paramsObj.indexOf('subTabIndex');
                    if (i > -1){
                        rlTab.subTabIndex = paramsObj[i+1];
                    }
                }
                result.push(rlTab);
            }
        });

        api.setState("RelatedRecordTabs", result);
    };

    const filterRL = (rlConfig) => {
        const inclusionList = rlConfig.inclusionList;
        const exclusionList = rlConfig.exclusionList;
        let filteredRL = RLData;

        if(!RLData){
            return [];
        }

        if (inclusionList && inclusionList.length != 0) {
            filteredRL = filteredRL.filter((item) => {
                return inclusionList.indexOf(item.relatedListName) != -1;
            });
        }

        if (exclusionList && exclusionList.length != 0) {
            filteredRL = filteredRL.filter((item) => {
                return exclusionList.indexOf(item.relatedListName) == -1;
            });
        }

        return filteredRL;
    };

    switch (eventName) {
        case 'DATA_FETCH_SUCCEEDED':
            if (event.elementId === 'related_list_configuration')
                getRLTabs();
            break;

        case 'CTRL_RECORD#MACROPONENT_PROPERTY_CHANGED':
            if (event.payload && event.payload.name === 'relatedLists')
                getRLTabs();
            break;

        default:
            break;
    }

}
