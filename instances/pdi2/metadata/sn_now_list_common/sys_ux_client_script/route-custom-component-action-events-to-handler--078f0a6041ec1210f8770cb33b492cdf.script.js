function script({api, event}) { 
  const eventName = event.payload?.detail?.type;
  if (!eventName) return;

  switch(eventName) {
      case 'SN_LIST_TAGS_CELL_EDITOR_CONTENT#VALUE_SUBMITTED':
            api.data.sn_record_list_data_broker.cellEditSubmitted(event.payload.detail.payload);
            return;
      // This case is currently triggered when Load More Rows button is clicked in parent/child.
      case 'NOW_BUTTON_BARE#CLICKED':
            if (event.payload?.detail?.payload?.typeofEvent == 'LoadMore') {
                  api.data.sn_record_list_data_broker.loadMoreRows(event.payload.detail.payload);
                  return;
            }
      case 'SN_ACTIONABLE_ROW#BUTTON_CLICKED':
            const action = event.payload?.detail?.payload?.action;
            if (action === 'SN_RECORD_LIST_DATA_BROKER#DATA_FETCH_TRY_AGAIN_INITIATED') {
                  api.data.sn_record_list_data_broker.dataFetchTryAgainInitiated(event.payload.detail.payload);
            }
            if (action === 'SN_RECORD_LIST_DATA_BROKER#AGGREGATES_ROW_FETCH_TRY_AGAIN_INITIATED') {
                  api.data.sn_record_list_data_broker.aggregatesRowFetchTryAgainInitiated(event.payload.detail.payload?.actionPayload);
            }
            if (action === 'SN_RECORD_LIST_DATA_BROKER#AGGREGATES_ROW_REFRESH_INITIATED') {
                  api.emit('LIST_CTRL#REFRESH_REQUESTED');
            }
            return;
      // column filtering show CB button
      case 'NOW_BUTTON#CLICKED':
            console.log('NOW_BUTTON#CLICKED', event.payload);
            // FIXME: because now_button#clicked has no payload, and appendToPayload doesn't work through our custom component API,
            // we have no way to get the name or other unique identifier of this button.
            // This will be an issue if someone tries to use a now-button as a custom column filter inside RLB because we will handle their action here.
            if (event.payload?.context === 'columnFilterValueInput') {
                  api.data.sn_record_list_data_broker.columnFilterConditionBuilderRedirectClicked(event.payload.detail.payload);
            }
            return;
      // This case takes care of when filter is applied on tags
      case 'SN_LIST_TAGS_CELL_EDITOR_CONTENT#TAG_FILTER_APPLIED':
            api.data.sn_record_list_data_broker.applyColumnHeaderFilter(event.payload.detail.payload);
            return;
      default:
            return;
  }

 }
