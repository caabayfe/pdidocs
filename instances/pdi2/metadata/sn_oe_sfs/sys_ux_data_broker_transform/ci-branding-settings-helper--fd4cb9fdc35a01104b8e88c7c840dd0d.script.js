function transform(input) {

    function _getUploadedFileName(attachmentSysId) {
        var gr = new GlideRecord('sys_attachment');
        if (gr.get(attachmentSysId)) return gr.getValue('file_name');
        return 'icon';
    }

    function _getCategories() {
        var categories = [{
                'id': 'category_#0',
                'label': sn_i18n.Message.getMessage("sn_oe_sfs",'Main chat window'),
                'icons': [{
                        'icon_value': 'new-conversation',
                        'default_icon': '/new-conversation.svg',
                        'display_state': 'input'
                    },
                    {
                        'icon_value': 'end-conversation',
                        'default_icon': '/end-conversation.svg',
                        'display_state': 'input'
                    },
                    {
                        'icon_value': 'contact-support',
                        'default_icon': '/contact-support.svg',
                        'display_state': 'input'
                    },
                    {
                        'icon_value': 'emoji',
                        'default_icon': '/emoji.svg',
                        'display_state': 'input'
                    },
                    {
                        'icon_value': 'send',
                        'default_icon': '/send.svg',
                        'display_state': 'input'
                    },
                    {
                        'icon_value': 'attachment',
                        'default_icon': '/attachment.svg',
                        'display_state': 'input'
                    },
                    {
                        'icon_value': 'masked',
                        'default_icon': '/masked.svg',
                        'display_state': 'input'
                    },
                    {
                        'icon_value': 'unmasked',
                        'default_icon': '/unmasked.svg',
                        'display_state': 'input'
                    },
                ]
            },
            {
                'id': 'category_#1',
                'label': sn_i18n.Message.getMessage("sn_oe_sfs",'All topics window'),
                'icons': [{
                        'icon_value': 'topic-list-back',
                        'default_icon': '/topic-list-back.svg',
                        'display_state': 'topicListOpen'
                    },
                    {
                        'icon_value': 'topic-list-search',
                        'default_icon': '/topic-list-search.svg',
                        'display_state': 'topicListOpen'
                    }
                ]
            },
            {
                'id': 'category_#2',
                'label': sn_i18n.Message.getMessage("sn_oe_sfs",'Support menu'),
                'icons': [{
                        'icon_value': 'contact-support-close',
                        'default_icon': '/contact-support-close.svg',
                        'display_state': 'contactSupportMenuOpen'
                    },
                    {
                        'icon_value': 'audio-alert',
                        'default_icon': '/audio-alert.svg',
                        'display_state': 'contactSupportMenuOpen'
                    },
                    {
                        'icon_value': 'notification',
                        'default_icon': '/notification.svg',
                        'display_state': 'contactSupportMenuOpen'
                    },
                    {
                        'icon_value': 'attachment',
                        'default_icon': '/notification.svg',
                        'display_state': 'contactSupportMenuOpen'
                    }
                ]
            },
            {
                'id': 'category_#3',
                'label': sn_i18n.Message.getMessage("sn_oe_sfs",'End conversation page'),
                'icons': [{
                    'icon_value': 'modal-close',
                    'default_icon': '/modal-close.svg',
                    'display_state': 'modalOpen'
                }]
            }
        ];
        return categories;
    }

    function _getIconCategory(id) {
        var categories = _getCategories();
        for (var i = 0; i < categories.length; i++) {
            var icons = categories[i].icons;
            for (var j = 0; j < icons.length; j++) {
                if (icons[j].icon_value == id) return {
                    'category_id': categories[i].id,
                    'icon': icons[j]
                };
            }
        }
        return null;
    }

    function _getIcons() {
        var response = {};
        var gr = new GlideRecord('va_branding_contact_menu');
        gr.addQuery('branding', input.sysId);
        gr.addQuery('type', 'icon');
        gr.query();
        while (gr.next()) {
            var iconId = gr.getValue('value');
            var categoryData = _getIconCategory(iconId);
            if (!categoryData) continue;
            var category = categoryData.category_id;
            if (response[category] == undefined) response[category] = {};
            var _iconPayload = {
                'id': gr.getUniqueValue(),
                'label': gr.getDisplayValue('label'),
                'highlight_icon': iconId,
                'display_state': categoryData.icon.display_state,
                'default_icon': categoryData.icon.default_icon,
                'default_icon_url': categoryData.icon.default_icon,
                'display_default_icon': gr.getValue('display_default_icon') == '1',
                '__type': 'icon_data'
            };
            if (gr.getValue('display_default_icon').toString() == 'true') {
                _iconPayload.icon = _iconPayload.default_icon;
                _iconPayload.icon_url = _iconPayload.default_icon_url;
                _iconPayload.icon_file_name = _getUploadedFileName(_iconPayload.default_icon);
            } else {
                _iconPayload.icon = gr.getValue('icon');
                _iconPayload.icon_url = (gr.getDisplayValue('icon') ? ('/' + gr.getDisplayValue('icon')) : '');
                _iconPayload.icon_file_name = _getUploadedFileName(gr.getValue('icon'));



            }
            response[category][iconId] = _iconPayload;
        }
        return response;
    }

    function parseIconResponse() {
        var response = [];
        var categories = _getCategories();
        var groupedIcons = _getIcons();
        categories.forEach(function(category) {
            response.push({
                '__type': 'group_name',
                'label': category.label,
                'id': null
            });
            category.icons.forEach(function(icon, index) {
                if (groupedIcons[category.id] && groupedIcons[category.id][icon.icon_value]) {
                    var iconData = groupedIcons[category.id][icon.icon_value];
                    iconData.__odd = (index % 2 == 0);
                    response.push(iconData);
                }
            });
        });
        return response;
    }

    function _fetchStandardMenuItems() {
        var response = [];
        var gr = new GlideRecord('va_branding_contact_menu');
        var query = 'type!=Icon^ORtype=NULL^branding=' + GlideStringUtil.escapeQueryTermSeparator(input.sysId);
        gr.addEncodedQuery(query, true);
        gr.query();
        while (gr.next()) {
            response.push({
                'icon': gr.getDisplayValue('icon'),
                'label': gr.getDisplayValue('label'),
                'type': gr.getDisplayValue('type'),
                'value': gr.getValue('value'),
                'sys_id': gr.getUniqueValue()
            });
        }
        return response;
    }

    function getMenuItems() {
        return {
            'translated_headers': {
                'icon': sn_i18n.Message.getMessage("sn_oe_sfs","Icon"),
                'label': sn_i18n.Message.getMessage("sn_oe_sfs","Label"),
                'type': sn_i18n.Message.getMessage("sn_oe_sfs","Type"),
                'value': sn_i18n.Message.getMessage("sn_oe_sfs","Value")
            },
            'menu_items': _fetchStandardMenuItems()
        };
    }

    function parseIconsPayloadForWebclinetProp(payload) {
        return payload.reduce(function(acc, item) {
            if (item.__type == 'icon_data') {
                acc[item.highlight_icon] = item.icon_url ? item.icon : null;
            }
            return acc;
        }, {});
    }

    function getColorFieldsWithGroups() {
        return [{
                'type': 'header',
                'key': '',
                'label': sn_i18n.Message.getMessage("sn_oe_sfs",'Chat Window'),
                'odd': true,
                'default_value': null
            },
            {
                'type': 'color',
                'key': 'header_bg_color',
                'label': sn_i18n.Message.getMessage("sn_oe_sfs",'Chat Header Background'),
                'odd': true,
                'default_value': '#4E7D88'
            },
            {
                'type': 'color',
                'key': 'bg_color',
                'label': sn_i18n.Message.getMessage("sn_oe_sfs",'Chat Background'),
                'odd': false,
                'default_value': '#ffffff'
            },
            {
                'type': 'color',
                'key': 'menu_icon_color',
                'label': sn_i18n.Message.getMessage("sn_oe_sfs",'Menu Icon'),
                'odd': true,
                'default_value': '#ffffff'
            },
            {
                'type': 'color',
                'key': 'header_font_color',
                'label': sn_i18n.Message.getMessage("sn_oe_sfs",'Chat Header Font'),
                'odd': false,
                'default_value': '#ffffff'
            },
            {
                'type': 'color',
                'key': 'input_bg_color',
                'label': sn_i18n.Message.getMessage("sn_oe_sfs",'Input Background'),
                'odd': true,
                'default_value': '#fafafa'
            },
            {
                'type': 'header',
                'key': '',
                'label': sn_i18n.Message.getMessage("sn_oe_sfs",'Chat messages'),
                'odd': true,
                'default_value': null
            },
            {
                'type': 'color',
                'key': 'bubble_bg_color',
                'label': sn_i18n.Message.getMessage("sn_oe_sfs",'User Bubble Background'),
                'odd': true,
                'default_value': '#68A1AF'
            },
            {
                'type': 'color',
                'key': 'agent_bubble_bg_color',
                'label': sn_i18n.Message.getMessage("sn_oe_sfs",'Agent Bubble Background'),
                'odd': false,
                'default_value': '#E9EDF1'
            },
            {
                'type': 'color',
                'key': 'bot_bubble_bg_color',
                'label': sn_i18n.Message.getMessage("sn_oe_sfs",'Bot Bubble Background'),
                'odd': true,
                'default_value': '#E9EDF1'
            },
            {
                'type': 'color',
                'key': 'link_color',
                'label': sn_i18n.Message.getMessage("sn_oe_sfs",'Link'),
                'odd': false,
                'default_value': '#68A1AF'
            },
            {
                'type': 'color',
                'key': 'button_bg_color',
                'label': sn_i18n.Message.getMessage("sn_oe_sfs",'Button Background'),
                'odd': true,
                'default_value': '#fff'
            },
            {
                'type': 'color',
                'key': 'notification_bg',
                'label': sn_i18n.Message.getMessage("sn_oe_sfs",'Notification Background'),
                'odd': false,
                'default_value': null
            },
            {
                'type': 'color',
                'key': 'bubble_font_color',
                'label': sn_i18n.Message.getMessage("sn_oe_sfs",'User Bubble Font'),
                'odd': true,
                'default_value': '#ffffff'
            },
            {
                'type': 'color',
                'key': 'agent_bubble_font_color',
                'label': sn_i18n.Message.getMessage("sn_oe_sfs",'Agent Bubble Font'),
                'odd': false,
                'default_value': '#343D47'
            },
            {
                'type': 'color',
                'key': 'bot_bubble_font_color',
                'label': sn_i18n.Message.getMessage("sn_oe_sfs",'Bot Bubble Font'),
                'odd': true,
                'default_value': '#343D47'
            },
            {
                'type': 'color',
                'key': 'disabled_link_color',
                'label': sn_i18n.Message.getMessage("sn_oe_sfs",'Link disabled'),
                'odd': false,
                'default_value': '#B8B8B8'
            },
            {
                'type': 'color',
                'key': 'notification_txt',
                'label': sn_i18n.Message.getMessage("sn_oe_sfs",'Notification Text'),
                'odd': true,
                'default_value': null
            },
            {
                'type': 'header',
                'key': '',
                'label': sn_i18n.Message.getMessage("sn_oe_sfs",'Others'),
                'odd': true,
                'default_value': null
            },
            {
                'type': 'color',
                'key': 'system_message_color',
                'label': sn_i18n.Message.getMessage("sn_oe_sfs",'System message'),
                'odd': true,
                'default_value': '#7f8e9f'
            },
            {
                'type': 'color',
                'key': 'category_bg_color',
                'label': sn_i18n.Message.getMessage("sn_oe_sfs",'Category background'),
                'odd': false,
                'default_value': '#efeff4'
            },
            {
                'type': 'color',
                'key': 'seperator_color',
                'label': sn_i18n.Message.getMessage("sn_oe_sfs",'Separator'),
                'odd': true,
                'default_value': '#B8B8B8'
            },
            {
                'type': 'color',
                'key': 'timestamp_color',
                'label': sn_i18n.Message.getMessage("sn_oe_sfs",'Time Stamp'),
                'odd': false,
                'default_value': '#767676'
            },
            {
                'type': 'color',
                'key': 'category_font_color',
                'label': sn_i18n.Message.getMessage("sn_oe_sfs",'Category font'),
                'odd': true,
                'default_value': '#6d6d72'
            },
            {
                'type': 'color',
                'key': 'load_animation_color',
                'label': sn_i18n.Message.getMessage("sn_oe_sfs",'Loading Animation'),
                'odd': false,
                'default_value': '#293e40'
            }
        ];
    }

    function getDefaultBrandingSettings() {
        var brandingSettings = {
            'header_label': 'Now Support',
            'menu_title': 'Contact Support',
            'msg_delay': '500',
            'support_email': 'support@servicenow.com',
            'support_email_label': 'Send Email to Customer Support',
            'support_hours_label': 'Contact Live Agent',
            'support_phone': '1-800-245-6000',
            'support_phone_label': 'Call Support (Daily 5AM - 11 PM)',
            'type_presence_delay': '1000',
            'va_logo': '735f7f1c73203300e985658b4cf6a78b.iix',
            'notification_txt': '#0F78C4',
            'notification_bg': '#efeff4',
            'requestor_client_version': 'DEBUG_VERSION'
        };
        var colorFields = getColorFieldsWithGroups();
        colorFields.forEach(function(color) {
            if (color.key) {
                brandingSettings[color.key] = color.default_value;
            }
        });
        return brandingSettings;
    }

    /* Helper APIs */
    var api = {
        'menu_item_icons': null,
        'menu_item_standard': null,
        'webclient_icons_prop': null,
        'color_fields_with_groups': null,
        'branding_settings': null
    };

    if (!input.sysId) return api;
    api.menu_item_icons = parseIconResponse();
    api.menu_item_standard = getMenuItems();
    api.webclient_icons_prop = parseIconsPayloadForWebclinetProp(api.menu_item_icons);
    api.color_fields_with_groups = getColorFieldsWithGroups();
    api.branding_settings = getDefaultBrandingSettings();
    return api;
}
