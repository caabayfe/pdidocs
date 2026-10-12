/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {TransformApiHelpers} params.helpers
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {
    //This will populate the breadcrumbs content
    //Get subscription name
    const subName = api.data.sub_ent_record.result.name.displayValue;
    const subSysId = api.context.props.sysId;
    const subDetailsRef = `now/subscription/subscription-details/${subSysId}/regularuser`;
    const subRef = 'now/subscription/home/params/sm/subscriptions';

    //Get app family details
    const appName = api.data.sub_app_family_record.result.family_name.displayValue;
    const translateSub = helpers.translateSync("Subscriptions");
    
    const breadcrumbs = [{
            "label": translateSub,
            "href": subRef
        },
        {
            "href": subDetailsRef,
            "label": subName
        },
        {
            "href": "#",
            "label": appName
        }
    ];

    return breadcrumbs;
}
