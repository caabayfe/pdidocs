/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    if (api.context.props.from === "access_finding")
        return [{
                "label": "Access management",
                "href": "/now/access-management/overview"
            },
            {
                "label": "Access findings",
                "href": "/now/access-management/access_findings"
            },
            {
                "label": "Task"
            }
        ];
    else
        return [{
                "label": "Security Center",
                "href": "/now/security-center-hub/overview",
                "icon": "home-outline"
            },
            {
                "label": "Security Tasks",
                "href": "/now/security-center-hub/security-tasks",
                "icon": "clipboard-lines-outline"
            },
            {
                "label": "Security Task"
            }
        ];
}
