var WebAuthnMetaDataHelper = Class.create();
WebAuthnMetaDataHelper.prototype = Object.extendsObject(AbstractAjaxProcessor, {

    loadAuthenticatorMetadataFromJSON: function() {
		try{
			var meta_json = this.getParameter("sysparm_meta_json");
			var result = this.newItem("result");
			var resultMap = SNC.GlideWebAuthnMetadata.fetchMetadataFromJSON(meta_json);
			var status = gs.nil(resultMap.get("status")) ? "false" : resultMap.get("status");
			
			if(status == "true" && !gs.nil(resultMap.get('sys_id'))) {
				result.setAttribute("status", true);
                result.setAttribute("sys_id", resultMap.get('sys_id'));
				return;
			}
			
			if(!gs.nil(resultMap.get("error_msg"))) {
				result.setAttribute("status", false);
                result.setAttribute("error_msg", resultMap.get("error_msg"));
			}
		} catch(e) {
			gs.error("Error in persisting metadata " + e);
			result.setAttribute("status", false);
            result.setAttribute("error_msg", gs.getMessage("Error in parsing metadata. Please try again"));
		}
    },

    loadAuthenticatorMetadataFromURL: function() {
       try {
			var meta_url_token = this.getParameter("sysparm_meta_url_with_token");
			var result = this.newItem("result");
			var resultMap = SNC.GlideWebAuthnMetadata.fetchMetadataFromURL(meta_url_token);
			var status = gs.nil(resultMap.get("status")) ? "false" : resultMap.get("status");
      
			if(status == "true" && !gs.nil(resultMap.get('sys_id'))) {
				result.setAttribute("status", true);
                result.setAttribute("sys_id", resultMap.get('sys_id'));
				return;
			}
   
           if(!gs.nil(resultMap.get("error_msg"))) {
				result.setAttribute("status", false);
                result.setAttribute("error_msg", resultMap.get("error_msg"));
			}
  
       } catch(e) {
           gs.error("Error in persisting metadata " + e);
           result.setAttribute("status", false);
           result.setAttribute("error_msg", gs.getMessage("Error in parsing metadata. Please try again"));
       }
    },
	
    type: 'WebAuthnMetaDataHelper'
});
