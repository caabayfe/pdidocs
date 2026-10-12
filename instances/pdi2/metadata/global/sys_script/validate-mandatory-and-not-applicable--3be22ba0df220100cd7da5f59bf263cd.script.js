// If this is a script metric, set mandatory and not applicable
// to false; they don't matter anyway
if (current.method == 'script' || current.datatype == 'checkbox') {
	current.mandatory = false;
	current.allow_not_applicable = false;
}

// If this is a percentage metric, set not applicable to false
// since 'not applicable' does not make sense for a text
// box (on the UI). If it is a script metric, it doesn't matter.
if (current.datatype == 'percentage') {
	current.allow_not_applicable = false;
}
