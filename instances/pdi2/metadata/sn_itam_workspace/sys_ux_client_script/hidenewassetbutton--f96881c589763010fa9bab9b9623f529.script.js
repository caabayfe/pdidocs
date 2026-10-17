function handler({
    api,
    event,
    helpers,
    imports
}) {
    if(parseInt(event.payload.selectedTabIndex,10) > 0){
        api.setState('hideNewAssetBtn', true);
    }else{
        api.setState('hideNewAssetBtn', false);
    }
}
