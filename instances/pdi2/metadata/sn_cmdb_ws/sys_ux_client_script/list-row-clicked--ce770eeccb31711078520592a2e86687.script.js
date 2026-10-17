function script({api, event, helpers, imports}) { 
    var routeObj = {
        route: '',
        fields: {},
        params: {},
        redirect: false,
        passiveNavigation: false,
        targetRoute: 'current',
        external: {},
        title: ''
    };

    var recordExternalLink = 'now/cmdb/record/'+event.payload.table+'/'+event.payload.sys_id;
    var external = {
            url: recordExternalLink
     };
     routeObj.external = external;

     api.emit('NAV_ITEM_SELECTED', routeObj);

 }
