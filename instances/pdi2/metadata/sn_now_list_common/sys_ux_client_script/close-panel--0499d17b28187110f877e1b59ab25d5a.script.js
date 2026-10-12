function script({api, event}) { 
      const {
        hasPageChanged,
        isInitialListLoad,
        infiniteCurrentPage
      } = api.state;

      const enableInfiniteScroll = api.data.sn_record_list_data_broker?.out?.enableInfiniteScroll;

      const {
        triggeredByDataFetch = false
      } = event.payload;
      if (isInitialListLoad) {
        // set intial load value to false after intial fetch
        api.setState('isInitialListLoad', false);
      }

      if (!hasPageChanged) {
        if(!(enableInfiniteScroll && infiniteCurrentPage>0 && triggeredByDataFetch)) {
          api.setState('horizontalPanePosition', 'left');
          api.setState('verticalPanePosition', 'top');
        }

        if (!triggeredByDataFetch) { // call set highlighted rows only for queries other than fetch
          api.emit('LIST_CTRL#SET_HIGHLIGHTED_ROWS', {
            rowKeys: null
           });
        }
        api.setState('sidePanelState', {
          isPanelOpened: false,
          panelCurrentRoute: ""
        });
      }
 }
