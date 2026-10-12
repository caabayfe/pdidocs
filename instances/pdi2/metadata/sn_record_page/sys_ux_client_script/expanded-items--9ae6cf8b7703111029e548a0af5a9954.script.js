function script({api, event}) { 
 api.setState('expandedItems', event.payload.value);
 }
