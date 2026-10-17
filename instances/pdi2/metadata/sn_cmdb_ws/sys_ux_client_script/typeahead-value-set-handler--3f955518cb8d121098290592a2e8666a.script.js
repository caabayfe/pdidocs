function script({api, event, helpers}) { 
    const {
          table,
          searchType, 
          encodedQuery,
          searchField,
          max,
          referenceKey
    } = api.context.props;
    const {
          searchText,
          debounceTimer
    } = api.state;
   
   const refreshSearch = () => {
          var inputSearchTxt = searchText;
          if(event.name == "NOW_TYPEAHEAD#VALUE_SET") {
                inputSearchTxt = event.payload.searchText;
                api.setState("searchText", inputSearchTxt);
           }

           api.data.manual_ci_perform_typeahead_search.execute({
               table: table,
               searchText:  inputSearchTxt,
               searchType: searchType,
               encodedQuery: encodedQuery,
               searchField: searchField,
               max: max,
               referenceKey: referenceKey
          });
     };
     
    const debounce = (callback, time) => {
        if(debounceTimer) {
            helpers.timing.clearTimeout(debounceTimer);
        }
        let newDebounceTimer = helpers.timing.setTimeout(callback, time);
        api.setState("debounceTimer",  newDebounceTimer);
    };

    debounce(refreshSearch, 500);
  
 }
