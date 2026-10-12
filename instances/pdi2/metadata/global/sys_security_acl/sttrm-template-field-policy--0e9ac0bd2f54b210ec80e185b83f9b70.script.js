function checkAccess() {
    var parentTemplateGr = current.sttrm_base_template.getRefRecord();

    if (parentTemplateGr && GlideDBObjectManager.get().getAllExtensions("sttrm_base_template").indexOf(parentTemplateGr.getTableName()) !== -1)
        return parentTemplateGr.canWrite();

    return false;
}

answer = checkAccess();
