var PlaybookUtils = Class.create();
PlaybookUtils.prototype = {
    initialize: function() {},

    getHighlightedState: function() {
        return {
            'new': {
                'color': 'purple',
                'icon': 'presence-fill',
                'variant': 'tertiary'
            },
            'in_progress': {
                'label': sn_i18n.Message.getMessage('sn_sow_record', 'In progress'),
                'color': 'blue',
                'icon': 'circle-semi-check-fill',
                'variant': 'tertiary'
            },
            'completed': {
                'label': sn_i18n.Message.getMessage('sn_sow_record', 'Completed'),
                'color': 'positive',
                'icon': 'check-fill',
                'variant': 'tertiary'
            },
            'failed': {
                'color': 'gray',
                'icon': 'ban-outline',
                'variant': 'secondary'
            },
            'canceled': {
                'color': 'low',
                'icon': 'close-fill',
                'variant': 'tertiary'
            },
            'not_started': {
                'label': sn_i18n.Message.getMessage('sn_sow_record', 'Not Started'),
                'color': 'purple',
                'icon': 'presence-fill',
                'variant': 'tertiary'
            },
            'complete': {
                'label': sn_i18n.Message.getMessage('sn_sow_record', 'Completed'),
                'color': 'positive',
                'icon': 'check-fill',
                'variant': 'tertiary'
            }
        };
    },

    type: 'PlaybookUtils'
};
