function script({api, event}) { 
const {
        value
    } = event.payload;
    var updatedListProps = {};
    if (value == 0) {
        updatedListProps.table = api.state.dataFilterTabArray[0].fields.table;
        updatedListProps.list_filter = api.state.dataFilterTabArray[0].fields.list_filter;
        updatedListProps.columns = api.state.dataFilterTabArray[0].fields.columns;
        updatedListProps.view = api.state.dataFilterTabArray[0].fields.view;
        updatedListProps.type = "included_records";
    } else if (value == 1) {
        updatedListProps.table = api.state.dataFilterTabArray[1].fields.table;
        updatedListProps.list_filter = api.state.dataFilterTabArray[1].fields.list_filter;
        updatedListProps.columns = api.state.dataFilterTabArray[1].fields.columns;
        updatedListProps.view = api.state.dataFilterTabArray[1].fields.view;
        updatedListProps.type = "excluded_records";
    }

    api.setState('listProps', ({currentValue}) => {
       return {
        ...currentValue,
        ...updatedListProps
      };
    });
 }
