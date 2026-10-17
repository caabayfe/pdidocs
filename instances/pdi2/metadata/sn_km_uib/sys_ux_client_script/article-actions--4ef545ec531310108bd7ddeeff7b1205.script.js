function handler({
    api,
    event,
    helpers,
    imports
}) {
    const {
        getOrigin,
        getClipboard,
        getTrimmedValue
    } = imports["sn_km_uib.Article actions include"]();
    if (event.elementId == "article_actions") {
        if (event.payload.item.id == "flag") {
         api.setState("flagArticleContent","");
            helpers.modal.open("[component-id$='custom_2']");
        }
        if (event.payload.item.id == "copyLink") {
            const articleResult = api.data.get_article_details_1.articleDetails;
            var permalink = getOrigin() + '/kb?id=kb_article_view&sysparm_article=' + articleResult.articleInfo.number;
            getClipboard().writeText(permalink).then(function() {
                helpers.translate('Link copied to clipboard').then((value) => {
                    api.emit("NOW_UXF_PAGE#ADD_NOTIFICATIONS", {
                        items: [{
                            id: "copyLinkAlert",
                            status: "info",
                            icon: "info-circle-outline",
                            content: value,
                            action: {
                                type: "dismiss"
                            }
                        }],
                    });
                });
            }, function(err) {
                helpers.translate('Unable to copy link to clipboard because of a browser limitation. Use the following link: ').then((value) => {
                    api.emit("NOW_UXF_PAGE#ADD_NOTIFICATIONS", {
                        items: [{
                            id: "copyLinkAlert",
                            status: "info",
                            icon: "info-circle-outline",
                            content: {
                                type: "jsx",
                                value: `<div><div>${value}</div><br /><div>${permalink}</div></div>`
                            },
                            action: {
                                type: "dismiss"
                            }
                        }]
                    });
                });
            });
        }
    } else if (event.elementId == "flag_comment") {
        var value = event.payload.fieldValue;
        var trimmedValue = getTrimmedValue(value);
        api.setState('flagArticleContent', trimmedValue);
    }
}
