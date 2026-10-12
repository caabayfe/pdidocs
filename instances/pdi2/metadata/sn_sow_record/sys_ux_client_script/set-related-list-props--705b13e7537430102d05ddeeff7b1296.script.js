function handler({api, event, helpers, imports}) {

    var eventName = event.name;

    const getSubTabIndex = () => {
        var paramsString = api.context.props.extraParams,
            paramsObj = paramsString?.split('/'),
            subTabIndex;

        if (paramsObj && paramsObj.length && !(paramsObj.indexOf('subTabIndex') < 0)) {
            subTabIndex = paramsObj[paramsObj.indexOf('subTabIndex') + 1];
            subTabIndex = parseInt(subTabIndex);
            if (isNaN(subTabIndex)) {
                subTabIndex = 0;
            }
        }
        return subTabIndex;
    };

    const getRefreshTimestamp = (rlName, rlCount, rlRefreshTime) => {
        const selectedListData = api.state.selectedListData;
        if (selectedListData && selectedListData.relatedListName == rlName && selectedListData.count != rlCount && selectedListData.timestamp > rlRefreshTime.timestamp) {
            return {
                timestamp: Date.now()
            };
        }
        return rlRefreshTime;
    };

    const updatedStateValues = (selectedItem) => {
        var i = selectedItem[0][0];
        api.setState("relatedListData", api.data.related_list_tabs_transform.output);
        api.setState("selectedItem", selectedItem);

        const rlRefreshTime = api.data.related_list_tabs_transform.output[i].value.refreshRequested;
        const rlName = api.data.related_list_tabs_transform.output[i].value.relatedListName;
        const rlCount = api.data.related_list_tabs_transform.output[i].value.count;
        
        api.setState("relatedListName", rlName);
        api.setState("listTitle", api.data.related_list_tabs_transform.output[i].value.title);
        api.setState("listTable", api.data.related_list_tabs_transform.output[i].value.table);
        api.setState("listFilter", api.data.related_list_tabs_transform.output[i].value.filter);
        api.setState("view", api.data.related_list_tabs_transform.output[i].value.view);
        api.setState("actionConfigId", api.data.related_list_tabs_transform.output[i].value.actionConfigId);
        api.setState("latestRefreshRequest", getRefreshTimestamp(rlName, rlCount, rlRefreshTime));
    };

    const setInitialStateValue = () => {
        var selectedItem = [[]];
        var i = 0;
        if (api.data.related_list_tabs_transform.output.length > 0) {
            var subTabIndex = getSubTabIndex();
            if (api.data.related_list_tabs_transform.output.length > subTabIndex) {
                i = subTabIndex;
            }
            selectedItem[0].push(parseInt(api.data.related_list_tabs_transform.output[i].id));
            updatedStateValues(selectedItem);
        }
    };

    const updateStateOnPropsChange = () => {
        var subTabindex = getSubTabIndex();
        if (subTabindex != api.state.selectedItem[0][0] && api.data.related_list_tabs_transform.output.length > 0) {
            var selectedItem = [[]];
            selectedItem[0].push(subTabindex);
            updatedStateValues(selectedItem);
        }
    };

    switch (eventName) {
        case 'MACROPONENT_PROPERTY_CHANGED':
            if (event.payload && event.payload.name === 'extraParams')
                updateStateOnPropsChange();
            break;

        case 'DATA_FETCH_SUCCEEDED':
            if (event.elementId === 'related_list_tabs_transform')
                setInitialStateValue();
            break;

        default:
            break;
    }
}
