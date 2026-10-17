(function(context, pageParams) {
    context.props_details.links = [{
        "label": "Step-by-step guide to enable link authentication in MS Teams",
        "value": {
            "href": gs.getProperty("glide.servlet.uri") + "/api/now/v1/context_doc_url/link-authentication-msteams"
        },
        "type": "external",
        "endsWith": {
            "type": "icon",
            "value": "open-link-right-fill"
        }
    }];
})(context, pageParams);
