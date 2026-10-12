function script({api, event}) {
    //reset list items and searchText whenever the table changes or timestamp is refreshed
    if(event.payload.name == "table" || event.payload.name == "ts") {
         api.setState("listItems", []);
         api.setState("searchText", "");
    }
    
 }
