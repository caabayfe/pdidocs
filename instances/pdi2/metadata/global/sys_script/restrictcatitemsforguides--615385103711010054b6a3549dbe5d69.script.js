function restrictCatItemsForGuides() {
	var prop = gs.getProperty("glide.sc.item.order_guide_exclusion"); 
	var qual = "sys_class_nameNOT IN"+prop;
	return qual;
}
