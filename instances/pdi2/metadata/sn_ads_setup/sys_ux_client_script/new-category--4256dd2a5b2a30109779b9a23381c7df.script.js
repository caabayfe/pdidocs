function handler({api, event}) { 
if (api.context.props.categoryId === '-1') {
        api.setState('currentTaskId', [['-1']]);
        api.setState('taskView', false);
    }
 }
