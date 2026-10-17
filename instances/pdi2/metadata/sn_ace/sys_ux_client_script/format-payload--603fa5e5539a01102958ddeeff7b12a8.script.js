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
    const payload = api.context.props.payload;
    const {
        title,
        subtitle,
        block_id
    } = payload;
    const {
        badge_color,
        badge_text,
        image
    } = payload.props_details;
    const formatProgressBar = function(items) {
        if (!items.length) return [];
        return items.map(function(item) {
            return {
                "block_id": item.block_id,
                "icon": item.props_details.header_icon,
                "title": item.title,
                "status": item.props_details.status && item.props_details.status.toLowerCase() || "start",
                "badgeColor": item.badgeColor,
                "badgeLabel": item.badgeLabel,
                "modalTitle": item.props_details.modalTitle,
                "modalButtonIcon": item.props_details.modalButtonIcon,
                "modalButtonLabel": item.props_details.modalButtonLabel || "Setup",
                "averageEffort": item.props_details.averageEffort,
                "showAverageEffort": item.props_details.showAverageEffort || true,
                "expertise": item.props_details.expertise,
                "showExpertise": item.props_details.showExpertise || true,
                "documentationLabel": item.props_details.documentationLabel,
                "documentationLink": item.props_details.documentationLink,
                "showDocumentation": item.props_details.showDocumentation || true,
                "children": formatProgressBar(item.children),
                "endpoint": item.props_details.endpoint || null,
                "record": item.block_id
            };
        });
    };
    const checklistCardPayload = {
        block_id,
        title,
        subtitle,
        imageURL: image,
        badgeColor: payload.badgeColor,
        badgeText: payload.badgeLabel,
        progressText: payload.progressText,
        items: formatProgressBar(payload.children)
    };
    api.setState('payload', checklistCardPayload);
}
