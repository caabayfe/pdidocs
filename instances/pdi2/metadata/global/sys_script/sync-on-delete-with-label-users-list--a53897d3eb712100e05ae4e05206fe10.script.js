sync();

function sync() {
	(new LabelUpdate()).syncUserLabelRemovalFromM2M(current);
}
