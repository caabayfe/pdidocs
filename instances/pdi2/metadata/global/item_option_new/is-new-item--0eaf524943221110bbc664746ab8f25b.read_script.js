if (!current) {
	answer = true;
}
else {
	answer = current.published_ref.nil() && current.state == 'draft';
}
