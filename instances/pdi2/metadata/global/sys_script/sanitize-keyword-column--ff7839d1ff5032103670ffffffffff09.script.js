(function executeRule(current, previous /*null when async*/) {
    
    // Check if the field you want to monitor has changed
    if (current.keyword.changes()) {
        var inputValue = current.keyword.getValue();
        
        if (inputValue) {
            current.keyword.setValue(generateKeywordFromInput(inputValue));
        }
    }
    
    function generateKeywordFromInput(inputValue) {
        var keyword = inputValue.toLowerCase().replace(/[^a-zA-Z0-9_]/g, '_');
        
        // Compact any multiple sequential underscores
        while (keyword.indexOf("__") != -1) {
            keyword = keyword.replace(/__/g, "_");
        }
        
        // Replace any trailing underscores
        while (keyword != '' && keyword.charAt(keyword.length - 1) == '_') {
            keyword = keyword.substring(0, keyword.length - 1);
        }
        
        return keyword;
    }
    
})(current, previous);
