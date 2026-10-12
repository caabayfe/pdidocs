function getRecordProducerParent() {
	if (typeof parent === 'undefined' || parent == null) {
		if (current) {
			var parentGr = current.cat_item.getRefRecord();
			if (parentGr && parentGr.instanceOf('sc_cat_item_producer'))
				return parentGr.table_name;
			var vsGR = current.variable_set.getRefRecord();
			if (vsGR && vsGR.instanceOf('item_option_new_producer_set'))
				return vsGR.table_name;
		}
		return "";
	} else
		return parent.table_name;
}
