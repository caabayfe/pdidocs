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
    if (api.context.app.enableExpandableActivityStreamTiles) {
        api.setState('activityStreamTileProps', {
            "attachmentTileComponent": "sn-csm-attachment-activity-tile",
            "auditRelationTileComponent": "sn-csm-auditrelation-activity-tile",
            "auditTileComponent": "sn-csm-audit-activity-tile",
            "emailTileComponent": "sn-csm-email-activity-tile",
            "journalTileComponent": "sn-csm-journal-activity-tile"
        });
    }

}
