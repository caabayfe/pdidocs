
// Script that is called when alert action button is clicked for dynamic CI Group
    function script({api, event, helpers, imports }) {
        let routeParams = api.state.dynamicCIGroupRouteParams;
        if(routeParams){
            helpers.navigate.to('list', routeParams.fields, routeParams.params, false, false, 'current');
    }
 }
