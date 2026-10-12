function handler({
    api,
    event,
    imports,
    helpers
}) {

    const articleData = api.data.get_article_details_1.articleDetails;
    var extraParamsProp = {};
if (api.context.props.extraParams) {
        var propsArray = api.context.props.extraParams.split("/");
            for (var i = 0; i < propsArray.length; i += 2) {
            extraParamsProp[propsArray[i]] = propsArray[i + 1];
        }
   if(extraParamsProp.citationPayload){
       const highlightData = JSON.parse(extraParamsProp.citationPayload);
    if(articleData && highlightData){

        helpers.timing.setTimeout(function() {
            var value = highlightData;
            var hash = "#:~:text=";
            if(value.prefix){
                var prefix = encodeURIComponent(value.prefix);
                prefix = prefix.replace(/-/g, '%2D');
                hash = hash + prefix + "-" + ",";
            }
            if(value.start){
                var start = encodeURIComponent(value.start);
                start = start.replace(/-/g, '%2D');
                hash = hash + start;
            }
            if(value.end){
                var end = encodeURIComponent(value.end);
                end = end.replace(/-/g, '%2D');
                hash = hash + "," + end;
            }
            if(value.suffix){
                var suffix = encodeURIComponent(value.suffix);
                suffix = suffix.replace(/-/g, '%2D');
                hash = hash + "," + "-" + suffix;
            }
            
            this.window.location.hash = hash;
            const newParams = {
                    ...extraParamsProp,
                    citationPayload:'{}'
                };
                const extraParams = Object.entries(newParams)
                    .map(([k, v]) => `${k}/${v}`)
                    .join('/');
                api.emit("CONTENT_UPDATED", {
                    params: { extraParams },
                    redirectEmptyState: false
                });
        },2000)
    }
   }
  }
     var helpPercent = (articleData.usefulYesCount && articleData.totalUsefulCount) ? 
        Math.round(articleData.usefulYesCount / articleData.totalUsefulCount *100) : 0;
    if (helpPercent>0) {
        helpers.translate('% found this helpful').then((value) => {
        api.setState('helpPercentMessage', helpPercent + value);
    });
        api.setState('isHelpPercentInfoHidden', false);
    }

	const {screen,translate} = helpers;
	if(articleData.articleSysId !=null){
		let articleTooltip = articleData.articleInfo.number;

        if(articleData.versionDetails.isInstalled && articleData.versionDetails.isEnabled){
            let articleVersionInfo;
            for(let counter=0; counter < articleData.versionInfo.versions.length; counter++){
                if(articleData.versionInfo.versions[counter].id === articleData.articleSysId){
                    articleVersionInfo = articleData.versionInfo.versions[counter].label;
                    break;
                }
            }

             articleTooltip += " v" + articleVersionInfo;
        }

       articleTooltip += " : " +  articleData.articleInfo.shortDescription;

        screen.updateStatus( {
            title : articleData.articleInfo.shortDescription,
            tooltipPreview : {
                primaryTitle : articleTooltip
            }
        });
    }

    if (articleData.versionDetails && articleData.versionDetails.newVersionAvailable) {
        var message = articleData.versionDetails.warningMessage;
        var versionMessage = "<div>"+message+"</div>";
        api.emit("NOW_UXF_PAGE#ADD_NOTIFICATIONS", {
            items: [{
                id: "versionAlert",
                status: "info",
                icon: "info-circle-outline",
                content: {
                    type: "html",
                    value: versionMessage
                },
                action: {
                    type: "dismiss"
                }
            }],
        });
    }


    if (articleData.articleInfo.isExpired) {
        helpers.translate('Article expired. Update its **Valid to**  date to make it available to users.').then((value) => {
            value = '<div>' + value.replace('**', '<i>').replace('**', '</i>') + '</div>';
            api.emit("NOW_UXF_PAGE#ADD_NOTIFICATIONS", {
                items: [{
                    id: "expiryAlert",
                    status: "info",
                    icon: "info-circle-outline",
                    content: {
                        type: "html",
                        value: value
                    },
                    action: {
                        type: "dismiss"
                    }
                }],
            });
        });
    }

if(articleData.errorMessage && articleData.errorMessage != "") {
        api.emit("NOW_UXF_PAGE#ADD_NOTIFICATIONS", {
            items: [{
                id: "errorMsg",
                status: "critical",
                content: {
                    type: "string",
                    value: articleData.errorMessage
                },
                action: {
                    type: "dismiss"
                }
            }],
        });
    }

    if(api.context.props.mode == 'redirect' && api.context.props.base != null) {
        helpers.translate("The article ** has been retired and replaced with the current article.").then((value) => {
            const baseArticleId = api.context.props.base;
            const baseArticleNumber = api.data.look_up_base_article.result.number.value;
            value = "<div>" + value.replace('**', "<a href='kb_view.do?sys_kb_id=" + baseArticleId + "'>" + baseArticleNumber + "</a>") + "</div>";

            api.emit("NOW_UXF_PAGE#ADD_NOTIFICATIONS", {
                items: [{
                    id: "redirectionAlert",
                    status: "info",
                    icon: "info-circle-outline",
                    content: {
                        type: "html",
                        value: value
                    },
                    action: {
                        type: "dismiss"
                    }
                }],
            });
        });
    }
}
