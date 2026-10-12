function handler({
      api,
      event,
      helpers,
      imports
    }) {
      if (api.state.aiGroupInfo?.requestedType == 'single') {
        api.setState('aiGroupInfo', {
              sysId: '',
              groupId: '',
              requestedType: 'grouped'
          });
        api.setState('currentPage',0);
        return;
      }
      api.data.sn_record_list_data_broker.applyPrevQuery();
    }
