function checkAccess() {
    // Check if parent has run out on us
    var parentTemplateGr = null;
    try {
        parentTemplateGr = parent;
    } catch (e) {
        parentTemplateGr = null;
    }

    return parentTemplateGr && parentTemplateGr.canWrite();
}

answer = checkAccess();
