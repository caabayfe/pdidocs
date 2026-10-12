/**
          * @param {params} params
          * @param {api} params.api
          * @param {TransformApiHelpers} params.helpers
          */
        function evaluateProperty({api, helpers}) {
          var default_img = "upload_upgrade_management_default_image.svg";
        	var family_release_name = api?.item.value.title?.split(" ")[0]?.toLowerCase();	
        	var imageMap = api?.data?.get_upgrade_details_overview_page?.output?.upgradeDetails?.upgradeOverviewDetails?.releaseImageUrls;
          if (!family_release_name || !imageMap) return default_img;

        	var imageMapObj = JSON.parse(imageMap);
    
          if (imageMapObj.hasOwnProperty(family_release_name)) {
            return imageMapObj[family_release_name]; 
            
          } 
          return default_img;
        }
