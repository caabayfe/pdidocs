function handler({
      api,
      event: {
          payload,
          payload: {
              name,
              value,
              previousValue
          }
      },
      helpers,
      imports
    }) {
      
      if (name === 'screen' &&
          value.isActive != previousValue.isActive
          && value.isActive
          && api.state.hasRecordChanges) {
            api.setState('hasRecordChanges', false);
            api.data.list_controller.refreshRequested({
                hideLoader: true
            });     
      }
      if (name === 'activityLogs' && value && value.size > 0) {
        const operationList = ['modified', 'updated', 'inserted', 'deleted', 'closed'];
        // Transform "value" and get the latest entry
        const map = Array.from(value).pop()[1];
        const crudActivitiesLength = map.activities.get('crud').length;
        if (crudActivitiesLength < 1)
            return;
        const {
            operation,
            sysId,
            timestamp
        } = map.activities.get('crud')[crudActivitiesLength - 1];
        if (operationList.includes(operation) &&
            sysId !== "-1" &&
            !api.context.props.screen.isActive &&
            !api.state.hasRecordChanges) {
            api.setState('hasRecordChanges', true);
        }
    }
    }
