if (current.operation() == "delete" && cxs_App.getBusiness(current).isOnRecordProducer())
	cxs_App.getBusiness(current).removeFromRecordProducer();
else if (current.operation() == "update" && cxs_App.getBusiness(previous).isOnRecordProducer(true) && current.sc_cat_item.changes())
	cxs_App.getBusiness(previous).removeFromRecordProducer();
