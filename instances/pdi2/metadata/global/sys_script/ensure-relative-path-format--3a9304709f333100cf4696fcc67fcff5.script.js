function onBefore(current, previous) {
	current.relative_path = new ScriptedRESTCommon().normalizeRelativePath(current.relative_path);
}
