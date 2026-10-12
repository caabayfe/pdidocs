if(current.getValue("ui_type") === "workspace")
      cxs_App.getBusiness(current).setName(current.getValue("results_header_text") + " [" + current.getValue("table") + "]");
      else
      cxs_App.getBusiness(current).setName();
