/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    const contentBlocks = api.data.ace_fetch_content_blocks.output;
    const channel = api.context.props.channel;

    if (contentBlocks) {
        var res = contentBlocks
            .filter(function(contentBlock) {
                return contentBlock.name === "Page Header BreadCrumbs";
            });

            if(channel == "teams") {
                res[0].props_details.breadcrumbs.splice(3,5);
            }
            
            if(channel == "slack") {
                res[0].props_details.breadcrumbs.splice(2,1);
                res[0].props_details.breadcrumbs.splice(3,4);
            }
                
            if(channel == "workplace") {
                res[0].props_details.breadcrumbs.splice(2,2);
                res[0].props_details.breadcrumbs.splice(3,3);
            }

            if(channel == "messenger") {
                res[0].props_details.breadcrumbs.splice(2,3);
                res[0].props_details.breadcrumbs.splice(3,2);
            }

            if(channel == "line") {
                res[0].props_details.breadcrumbs.splice(2,4);
                res[0].props_details.breadcrumbs.splice(-1,1);
            }

            if(channel == "google-chat") {
                res[0].props_details.breadcrumbs.splice(2,5);
            }
        if (res.length > 0) return res[0].props_details.breadcrumbs;
    }
}
