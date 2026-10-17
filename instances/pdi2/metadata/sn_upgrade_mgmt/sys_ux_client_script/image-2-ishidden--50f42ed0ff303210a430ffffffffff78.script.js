/**
      * @param {params} params
      * @param {api} params.api
      * @param {TransformApiHelpers} params.helpers
      */
    function evaluateProperty({api, helpers}) {
    	var family_release_name = api?.state.resumeUpgradeData.targetPatch?.split(" ")[0]?.toLowerCase();
      var imageMap = api?.data?.get_upgrade_details_overview_page?.output?.upgradeDetails?.upgradeOverviewDetails?.releaseImageUrls;
      if (!family_release_name || !imageMap) return true;

      const imageMapObj = JSON.parse(imageMap);
    
      if (imageMapObj.hasOwnProperty(family_release_name)) {
        return false;
      }
      return true;
    
    }
