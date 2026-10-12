/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {
    const eventName = event.name;

    const processRLData = () => {
        let RLData = api.context.props.relatedListsData;
        if (!RLData) {
            //render empty state
            return;
        }
        let selectedCTItem = api.state.selectedCTItem; //[[0]]
        let selectedRLData = api.state.selectedRLData;
        let transformedRLData = api.state.transformedRLData;

        transformedRLData = transformRL(RLData);
        api.setState("transformedRLData", transformedRLData);
        if (event.context.item && event.context.item.value && event.context.item.value.selectedTabIndex)
            api.setState("selectedTabIndex", event.context.item.value.selectedTabIndex);
        if (transformedRLData.length != 0) {
            let selectedIndex = getSelectedRLIndex(transformedRLData);
            let selectedRLDataNew = transformedRLData[selectedIndex].value;
            if (!selectedRLData || (selectedRLDataNew.relatedListName != selectedRLData.relatedListName))
                api.setState("selectedRLData", selectedRLDataNew);
            api.setState("selectedCTItem", [
                [selectedIndex]
            ]);
            api.setState("selectedSubTabIndex", selectedIndex);
        }
    };

    //update last refreshed & count
    const updateLastRefreshed = () => {
        const {query, currentPage} = event.payload;
        const selectedIndex = api.state.selectedCTItem[0][0];
        let transformedRLData = api.state.transformedRLData;
        let currentRLData = transformedRLData[selectedIndex];
        currentRLData.value = {
            ...currentRLData.value,
            count: event.payload.model.layoutQuery.count,
            refreshRequested: {
                timestamp: new Date().getTime()
            }
        };
        currentRLData.label = event.payload.listTitle + " (" + currentRLData.value.count + ")";
        transformedRLData[selectedIndex] = currentRLData;
        api.setState("transformedRLData", [...transformedRLData]);
        api.setState('selectedRLQuery',query);
        api.setState('selectedRLPage',currentPage);
    };

    const updateSelectedRLData = () => {
        if (event.context.item && event.context.item.value && event.context.item.value.selectedTabIndex)
            api.setState("selectedTabIndex", event.context.item.value.selectedTabIndex);
        const selectedIndex = event.payload.item.id;
        const currentSelectedIndex = api.state.selectedCTItem[0] ? api.state.selectedCTItem[0][0] : null;
        if (currentSelectedIndex != selectedIndex) {
            api.setState("selectedRLData", event.payload.item.value);
            api.setState('selectedRLQuery','');
            api.setState('selectedRLPage',0);
            api.setState("selectedCTItem", [
                [selectedIndex]
            ]);
            api.setState("selectedSubTabIndex", selectedIndex);
        }
    };

    const getSelectedRLIndex = (transformedRLData) => {
        let index = 0;
        if (event.name === 'MACROPONENT_READY' || (event.payload && event.payload.name === 'subTabIndex'))
            index = api.context.props.subTabIndex;
        else
            index = api.state.selectedSubTabIndex;
        index = parseInt(index);
        if (!index || isNaN(index) || index == -1 || index >= transformedRLData.length) {
            index = 0;
        }
        return index;
    };

    const transformRL = (rlData) => {
        let transformedRL = [];
        if (!rlData) {
            return transformedRL;
        }
        let i = 0;
        while (i < rlData.length) {
            if (rlData[i].visible) {
                transformedRL.push({
                    "id": i,
                    "value": {
                        "title": rlData[i].displayName,
                        "table": rlData[i].table,
                        "filter": rlData[i].fixedQuery,
                        "relatedListName": rlData[i].value,
                        "view": rlData[i].view,
                        "actionConfigId": rlData[i].actionConfigId,
                        "count": rlData[i].count,
                        "isParentNewRecord": rlData[i].isParentNewRecord,
                        "isParentReadOnly": rlData[i].isParentReadOnly
                    },
                    "label": rlData[i].displayName + " (" + rlData[i].count + ")"
                });
            }
            i++;
        }
        return transformedRL;
    };

    const hasListChanged = (array1, array2) => {
        return (JSON.stringify(array1) != JSON.stringify(array2));
    };

    switch (eventName) {
        case 'MACROPONENT_READY':
            processRLData();
            break;

        case 'MACROPONENT_PROPERTY_CHANGED':
            if (event.payload && event.payload.name === 'relatedListsData') {
                if (hasListChanged(event.payload.previousValue, event.payload.value)) {
                    if (event.payload.previousValue[api.state.selectedSubTabIndex]['refreshRequested']['timestamp'] < event.payload.value[api.state.selectedSubTabIndex]['refreshRequested']['timestamp']) {
                        processRLData();
                        api.data.list_controller.refreshRequested({
                            hideLoader: false
                        });
                    }
                }
            } else if (event.payload && event.payload.name === 'subTabIndex' && event.payload.value)
                processRLData();
            break;
        
        case 'LIST_CTRL#DATA_FETCH_SUCCEEDED':
            updateLastRefreshed();
            api.emit("RELATED_RECORDS_REFRESH_REQUESTED", event.payload);
            break;

        case 'NOW_CONTENT_TREE#ITEM_CLICKED':
            updateSelectedRLData();
            var i = event.payload.item.id;
            var paramsString = api.context.props.extraParams,
                paramsObj = paramsString?.split('/');
            if (!paramsObj || !paramsObj.length) {
                paramsObj = [];
            }

            if (!(paramsObj.indexOf('subTabIndex') < 0)) {
                paramsObj[paramsObj.indexOf('subTabIndex') + 1] = i;
            } else {
                paramsObj.push("subTabIndex");
                paramsObj.push(i);
            }
            const finalParams = paramsObj.join("/");
            api.emit('CONTENT_UPDATED', {
                params: {
                    extraParams: finalParams
                }
            });
            break;

        default:
            break;
    }
}
