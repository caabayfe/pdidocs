function handler({
    api,
    helpers
}) {
    const output = api.data.interaction_query.output;
    if (output === undefined || output.data.GlideRecord_Query.interaction._results.length == 0)
        return;

    const {
        type: {
            value: type
        },
        active: {
            value: active
        }
    } = output.data.GlideRecord_Query.interaction._results[0];

    const ICON_CHAT_FILL = 'chat-fill';
    const ICON_CHAT_OUTLINE = 'chat-outline';
    const ICON_PHONE_FILL = 'phone-fill';
    const ICON_PHONE_OUTLINE = 'phone-outline';
    const ICON_VIDEO_FILL = 'video-fill';
    const ICON_VIDEO_OUTLINE = 'video-outline';
    const ICON_GROUP_FILL = 'user-fill';
    const ICON_GROUP_OUTLINE = 'user-outline';
    const ICON_ONGOING_FILL = 'ongoing-fill';
    const ICON_ONGOING_OUTLINE = 'ongoing-outline';
    const iconConfig = {
        phone: {
            active: ICON_PHONE_FILL,
            inactive: ICON_PHONE_OUTLINE
        },
        video: {
            active: ICON_VIDEO_FILL,
            inactive: ICON_VIDEO_OUTLINE
        },
        chat: {
            active: ICON_CHAT_FILL,
            inactive: ICON_CHAT_OUTLINE
        },
        walkup: {
            active: ICON_GROUP_FILL,
            inactive: ICON_GROUP_OUTLINE
        },
        messaging: {
            active: ICON_ONGOING_FILL,
            inactive: ICON_ONGOING_OUTLINE
        }
    };

    const status = active ? "active" : "inactive";
    const getIndicatorIcon = ({
        type,
        status
    }) => {
        const iconType = iconConfig[type];
        return iconType ? iconType[status] : '';
    };

    const updateStatus = (iconName, status, newTitle) => {
        helpers.timing.setTimeout(() => {
            helpers.screen.updateStatus({
                icon: {
                    name: iconName,
                    status: status
                },
                title: newTitle
            });
        }, 100);
    }

    const tabTitleText = api.state.tabTitleText;
    const hasTabTitleText = tabTitleText && tabTitleText.length > 0;
    const iconName = getIndicatorIcon({
        type,
        status
    });

    if (tabTitleText && tabTitleText.length > 0) {
        if (active) {
            helpers
                .translate(' - active conversation')
                .then((translated) => updateStatus(iconName, status, tabTitleText + translated));
        } else {
            updateStatus(iconName, status, tabTitleText);
        }
    } else {
         updateStatus(iconName, status, null);
    }
}
