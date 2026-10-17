function onBefore(current, previous) {
	current.user_filter = current.user_filter.replace(/ /g,'');
}
