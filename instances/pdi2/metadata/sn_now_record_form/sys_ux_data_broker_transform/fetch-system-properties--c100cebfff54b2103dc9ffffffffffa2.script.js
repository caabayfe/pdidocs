function transform(input) {
	const {props} = input;

	if (!props) return {};

	const ALLOWED_PROPS = new Set([
		'com.glide.agentic_processes_view.enabled'
	]);

	const norm = (prop) => !prop ? '' : `${prop}`.trim();

	const output = {};
	props.split(',').forEach((p) => {
		const prop = norm(p);
		if (ALLOWED_PROPS.has(prop)) {
			output[prop] = gs.getProperty(prop);
		}
	});

    return output;
}
