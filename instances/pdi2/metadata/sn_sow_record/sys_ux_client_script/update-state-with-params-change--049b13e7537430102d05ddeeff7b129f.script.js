function handler({api, event, helpers, imports}) {

    var i = event.payload.item.id;
    var selectedItem = [[]];
    selectedItem[0].push(i);
    if (api.state.selectedItem && i != api.state.selectedItem[0][0]) {
        api.setState("listTitle", event.payload.item.value.title);
        api.setState("listTable", event.payload.item.value.table);
        api.setState("listFilter", event.payload.item.value.filter);
        api.setState("relatedListName", event.payload.item.value.relatedListName);
    }

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
    api.setState("selectedItem", selectedItem);

    api.emit('CONTENT_UPDATED', {
            params: {
                selectedTabIndex: api.context.props.selectedTabIndex,
                query: api.context.props.query,
                views: api.context.props.views,
                extraParams: finalParams
            }
    });
}
