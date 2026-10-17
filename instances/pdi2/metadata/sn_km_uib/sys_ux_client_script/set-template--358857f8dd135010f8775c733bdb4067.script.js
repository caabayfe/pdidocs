function handler({api, event, imports}) {
    var template =event.payload.item? event.payload.item.id:null;
    if(template){
    	api.setState("template",template);
    }
}
