function script({api, event}) {  
  api.data.sn_record_list_data_broker.dataFetchSucceeded({
    listData: api.data.sn_record_list_composite_broker.output
  });

  const notifications = api.data.sn_record_list_composite_broker.output?.GlideDomain_Query?.session?.notifications
    ?.filter(notification => notification?.text) ?? [];
  if (notifications.length === 0)
    return;

  const getStatusIcon = status => {
    switch (status) {
      case 'info':
      default:
        return { icon: 'circle-info-outline', status: 'info' };
      case 'critical':
      case 'warning':
        return { icon: 'circle-exclamation-outline', status };
      case 'high':
      case 'moderate':
      case 'low':
        return { icon: 'circle-info-outline', status };
      case 'error':
        return { icon: 'circle-close-outline', status: 'critical' };
      case 'positive':
      case 'success':
        return { icon: 'circle-check-outline', status: 'positive' };
      case 'suggestion':
        return { icon: 'sn-sparkmoji-logo-outline', status: 'moderate' };
    }
  };

  const toItem = ({ type:status = 'info', text: value }) => ({
    ...getStatusIcon(status),
    content: { type: 'html', value },
    action: { type: 'dismiss' }
  });

  const items = notifications.map(notification => toItem(notification));
  api.emit('LIST_CTRL#ADD_NOTIFICATIONS', { items });
}
