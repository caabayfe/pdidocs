async function script({api, event, helpers}) {
    // Show an alert when a column is auto unpinned or pinned.
    const header = await helpers.translate('Pinned columns adjusted.');
    const value = await helpers.translate('They will be restored when space is available again.');
    api.emit('LIST_CTRL#ADD_NOTIFICATIONS', {
        items: [
            {
                status: 'warning',
                icon: 'circle-exclamation-outline',
                header,
                content: {
                    type: 'string',
                    value,
                },
                action: { type: 'dismiss', id: 'now_alert_pinned_columns_alert_dismissed' },
                id: 'now_alert_pinned_columns_alert_dismissed',
            },
        ],
    });
    api.emit('SEISMIC_ARIA_LIVE_REGION_UPDATE_REQUESTED', {
        message: `${header} ${value}\n`,
        type: 'assertive',
    });
}
