function handler({api, event, helpers, imports}) {
        if (event.name === 'RECORD_WATCHER#MESSAGE_RECEIVED') {
            const {data} = event.payload;
            const {parsedResult} = api.state;
            if (!data || !parsedResult || !data.changes || data.changes.length === 0)
                return;

            const changeSet = new Set();
            data.changes.forEach(changedField => changeSet.add(changedField));
            const displayedFields = api.context.props.fields?.split(',') || [];

            if (displayedFields.some(field => changeSet.has(field)))
                api.data.lookup_selected_record_fields.refresh();
            else if (parsedResult.headingName !== data.display_value)
                api.setState('parsedResult', {...parsedResult, headingName: data.display_value});
        } else if (event.name === 'RECORD_WATCHER#SUBSCRIPTION_FAILED') {
            console.warn('RECORD_WATCHER#SUBSCRIPTION_FAILED');
        }
    }
