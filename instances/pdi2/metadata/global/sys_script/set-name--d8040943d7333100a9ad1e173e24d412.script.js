function onBefore(current, previous) {
	if (!current.sp_page.title.nil())
		current.name = current.sp_page.title;
	else
		current.name = current.sp_page.id;
	current.name += " - Container " + current.order;
}
