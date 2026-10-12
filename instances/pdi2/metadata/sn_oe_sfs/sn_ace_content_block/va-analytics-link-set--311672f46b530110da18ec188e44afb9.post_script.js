(function(context, pageParams) {
    var link = '/now/conversation/settings/overview/params/start-date/{startDate}/end-date/{endDate}';
    var startDate = new GlideDateTime(gs.daysAgo(30)).getDate().toString();
    var endDate = new GlideDateTime().getDate().toString();
    link = link.replace('{startDate}', startDate).replace('{endDate}', endDate);
    context.props_details.links = [{
        "label": gs.getMessage("See more in VA Analytics"),
        "value": {
            "href": link
        },
        "type": "external",
        "endsWith": {
            "icon": "open-link-right-outline",
            "type": "icon",
        }
    }];
    context.props_details.size = 'sm';
    context.props_details.width = '100%';
})(context, pageParams);
