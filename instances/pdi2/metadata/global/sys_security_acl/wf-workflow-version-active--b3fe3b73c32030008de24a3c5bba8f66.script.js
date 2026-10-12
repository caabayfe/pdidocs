isNotSubflow();

function isNotSubflow() {
    var isSubflow = new WorkflowValidateUtil().validateParentFlows(current).level;
    if (isSubflow == 1) 
        return false;
    return true;
}
