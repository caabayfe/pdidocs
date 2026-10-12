(function executeRule(current, previous /*null when async*/ ) {

    if (current.name) {
        var updatedName = current.name.toString();

		updatedName = new SanitizeInputFieldHelper().sanitizeField(updatedName);
		updatedName = GlideStringUtil.escapeHTML(updatedName);

        current.name = updatedName;
    }
})(current, previous);
