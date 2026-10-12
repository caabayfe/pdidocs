(function executeRule(current, previous) {
    var displayName = current.name.replace(/^now-/, '')
        .replace(/--/g, ' - ')
        .replace(/(\w)[-_](\w)/g, '$1 $2')
        .replace(/(\w)(\w*)/g, function(_, first, remain) {
            return first.toUpperCase() + remain.toLowerCase();
        });

    current.display_name = displayName;
})(current, previous);
    
