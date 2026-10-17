function checkAccess() {
    // Check if parent has run out on us
    var parentTemplateGr = null;
    try {
        parentTemplateGr = parent;
    } catch (e) {
        parentTemplateGr = null;
    }

    if (parentTemplateGr && GlideDBObjectManager.get().getAllExtensions("sttrm_base_template").indexOf(parentTemplateGr.getTableName()) !== -1) {
        return parentTemplateGr.canWrite();
    }

    return false;
}

answer = checkAccess();
