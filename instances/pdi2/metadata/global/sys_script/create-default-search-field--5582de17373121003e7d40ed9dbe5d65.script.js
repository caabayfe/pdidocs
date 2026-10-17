if (current.operation() == "insert")
	cxs_App.getBusiness(current).createDefaultSearchField();
else if (current.operation() == "update" && current.table.changes())
	cxs_App.getBusiness(current).createDefaultSearchField();
