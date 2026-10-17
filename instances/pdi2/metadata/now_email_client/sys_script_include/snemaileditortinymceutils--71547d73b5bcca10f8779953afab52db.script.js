SnEmailEditorTinyMCEUtils = function() {
    var renameToolbar = function(replacementMap) {
        return function(toolbar) {
            // Create a regular expression pattern for all keys in the replacement map
            var pattern = new RegExp('\\b(' + Object.keys(replacementMap).join('|') + ')\\b', 'g');
            // Replace occurrences based on the map
            return toolbar.replace(pattern, function(match) {
                return replacementMap[match] || match; // Use the replacement from the map or the original match if not found
            });
        };
    }
    var flow = function() {
        var funcs = [].slice.call(arguments);
        return function(value) {
            if (funcs.length > 0) {
                value = funcs.reduce(function(val, func) {
                    return func(val);
                }, value);
            }
            return value;
        };
    };

    var addFormatPainterPlugin = function() {
        return function(toolbar) {
            // Split by spaces to get individual items
            var items = toolbar.split(' ');

            // Find the positions of 'undo' and 'redo'
            var undoIndex = items.indexOf('undo');
            var redoIndex = items.indexOf('redo');

            // Determine where to insert 'formatPainter'
            var insertIndex = -1;

            // If both exist, insert after the one that comes later
            if (undoIndex !== -1 && redoIndex !== -1) {
                insertIndex = Math.max(undoIndex, redoIndex) + 1;
            }
            // If only undo exists
            else if (undoIndex !== -1) {
                insertIndex = undoIndex + 1;
            }
            // If only redo exists
            else if (redoIndex !== -1) {
                insertIndex = redoIndex + 1;
            }
            // If neither exists, add at the end
            else {
                items.push('formatPainter');
                return items.join(' ');
            }

            // Insert 'formatPainter' at the determined position
            items.splice(insertIndex, 0, 'formatPainter');
            return items.join(' ');
        };
    };
    
    return {
        renameToolbar: renameToolbar,
        flow: flow,
        addFormatPainterPlugin: addFormatPainterPlugin,
    };
};
