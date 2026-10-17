
    
      /** 
      * ServiceNow 
      * 
      * Description: The idea of this script is to prevent any input apart from alphanumeric 
      *	characters for view names. Also prevents Xss via sysparm_view 
      **/ 

      var viewManager = new GlideScriptViewManager(current.name); 
      
      if (!viewManager.isValidViewName(current.name)) { 
        current.setAbortAction(true); 
        gs.addErrorMessage(gs.getMessage("A view name can only contain alphanumeric characters")); 
      }
