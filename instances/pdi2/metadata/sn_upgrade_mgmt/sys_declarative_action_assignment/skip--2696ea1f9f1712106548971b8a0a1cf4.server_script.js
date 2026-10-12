try {
	current.state = "SKIPPED";
	current.update();
} catch(e) {
	gs.error(e);
}
