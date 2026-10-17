function onChange() {
    document.querySelectorAll('.form-group').forEach(function(group) {
        // Hide all .multiLineEditor-mount except the first one
        var multiLineEditors = group.querySelectorAll('.multiLineEditor-mount');
        multiLineEditors.forEach(function(editor, index) {
            if (index > 0) {
                editor.style.display = 'none';
            }
        });

        // Hide all .singleLineEditor-mount except the first one
        var singleLineEditors = group.querySelectorAll('.singleLineEditor-mount');
        singleLineEditors.forEach(function(editor, index) {
            if (index > 0) {
                editor.style.display = 'none';
            }
        });

        // Hide all .defaultInput-mount except the first one
        var defaultInputEditors = group.querySelectorAll('.defaultInput-mount');
        defaultInputEditors.forEach(function(editor, index) {
            if (index > 0) {
                editor.style.display = 'none';
            }
        });

        // Hide all .documentId-mount except the first one
		var documentIdEditors = group.querySelectorAll('.documentId-mount');
        documentIdEditors.forEach(function(editor, index) {
            if (index > 0) {
                editor.style.display = 'none';
            }
        });
    });
}
