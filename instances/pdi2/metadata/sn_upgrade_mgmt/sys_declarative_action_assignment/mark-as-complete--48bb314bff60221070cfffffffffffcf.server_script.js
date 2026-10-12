try {
	current.state = "COMPLETE";
	current.update();
} catch(e) {
	gs.error(e);
}
