(function executeRule(current, previous /*null when async*/ ) {
    var exists = false;
    var nluModel = new NLUModel(current.model);
    var entityGr = nluModel.getEntities('name=' + current.name);
    while (entityGr.next()) {
        if (entityGr.getValue('name') === current.getValue('name') && entityGr.sys_id != current.sys_id) exists = true;
    }
    if (exists) {
        gs.addErrorMessage(gs.getMessage('Entity with same name already exists.'));
        current.setAbortAction(true);
    }
})(current, previous);
