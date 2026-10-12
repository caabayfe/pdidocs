function canWriteSysTrigger() {
    var docId = current.document_key + "";
    if (gs.nil(docId)) {
        return true;
    }
        
    var baseTable = GlideDBObjectManager.getAbsoluteBase(current.document + "");
    if (baseTable != "sysauto") {
        return true;
    }
    
    return false;
}
canWriteSysTrigger();
