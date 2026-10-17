(function executeRule(current, previous /*null when async*/) {
    
    if (current.attribute.applies_to == 1) {
        current.setAbortAction(true);
        return;
    }
    if (current.attribute.attribute == "dot_walk_fields") {
        var elementDescriptor = GlideTableDescriptor.get(current.source).getElementDescriptor(current.field);
        // only inlcude dot-walk attribute when column is reference
        if (!elementDescriptor.isReference()) {
            current.setAbortAction(true);
        }
    }
})(current, previous);
