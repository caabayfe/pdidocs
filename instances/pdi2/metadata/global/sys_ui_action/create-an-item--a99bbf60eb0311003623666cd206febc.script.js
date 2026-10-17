var newItemURL = "sc_ic_item_staging.do?sys_id=-1&sysparm_query=sc_catalogs=" + current.sc_catalog.getDisplayValue() + "^sc_categories=" + current.sc_category.getDisplayValue();
gs.setRedirect(newItemURL);
