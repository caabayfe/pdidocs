async function handler({api, event, helpers, imports}) {  
    const versionStr = api.context.props.versions+"";
    const versionStrArray = versionStr.split(',');
    if (versionStrArray.length != 2) {
      helpers.translate("You can compare only two versions of a knowledge article. Revise your selection of versions and try again.").then((value) => {
        api.emit("NOW_UXF_PAGE#ADD_NOTIFICATIONS", {
       	 	items: [{
            	id: "versionCompareMessage",
            	 status: "critical",
                icon: "info-circle-outline",
            	content: value
        	}],
    	  });               
      });
      api.setState("hideComparisonScreen", true);
    } else {
		  api.setState("hideComparisonScreen", false);
      api.setState("pageLabel", await helpers.translate("Compare article versions"));
    }
    const title = await helpers.translate('Compare versions');
    api.emit('SCREEN_STATUS_CHANGED', { title: title});
    
}
