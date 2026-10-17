var gr = new GlideRecord("pa_dashboards");
if (gr.get(current.dashboard)) {
	answer = gr.canWrite();
} else {
	answer = false;
}
