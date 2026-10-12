/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {
    const output = api.data.interaction_query.output;
    if (output === undefined || output.data.GlideRecord_Query.interaction._results[0] === undefined)
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
    const ICON_GROUP_FILL = 'user-fill';
    const ICON_GROUP_OUTLINE = 'user-outline';
    const ICON_ONGOING_FILL = 'ongoing-fill';
    const ICON_ONGOING_OUTLINE = 'ongoing-outline';
    const ICON_VIDEO_FILL = 'video-chat-fill';
    const ICON_VIDEO_OUTLINE = 'video-chat-outline';
    const ICON_MICROSOFT_FILL = 'microsoft-teams-fill';
    const ICON_MICROSOFT_OUTLINE = 'microsoft-teams-outline';
    const ICON_ZOOM_FILL = 'zoom-fill';
    const ICON_ZOOM_OUTLINE = 'zoom-outline';

    const iconConfig = {
        phone: {
            active: ICON_PHONE_FILL,
            inactive: ICON_PHONE_OUTLINE
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
        },
        video: {
            active: ICON_VIDEO_FILL,
            inactive: ICON_VIDEO_OUTLINE
        },
        microsoft_teams_chat: {
            active: ICON_MICROSOFT_FILL,
            inactive: ICON_MICROSOFT_OUTLINE
        },
        teams_call: {
            active: ICON_MICROSOFT_FILL,
            inactive: ICON_MICROSOFT_OUTLINE
        },
        zoom_chat: {
            active: ICON_ZOOM_FILL,
            inactive: ICON_ZOOM_OUTLINE
        }
    };

    const status = active ? "active" : "inactive";
    const getIndicatorIcon = ({
        type,
        status
    }) => {
        const iconType = iconConfig[type];
        return iconType ? iconType[status] : iconConfig['chat'][status];
    };

    const updateStatus = (iconName, status) => {
        helpers.timing.setTimeout(() => {
            helpers.screen.updateStatus({
                icon: {
                    name: iconName,
                    status: status
                }
            });
        }, 100);
    };
    const iconName = getIndicatorIcon({
        type,
        status
    });
    updateStatus(iconName, status);
}
