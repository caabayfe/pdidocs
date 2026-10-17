answer = gs.hasRole("catalog_admin") || current.getValue('manager') == gs.getUserID()|| (current.getValue('editors').indexOf(gs.getUserID())!=-1);
