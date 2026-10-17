answer = execute();

function execute() {
    var interactionId = current.getValue('interaction');
    if (gs.nil(interactionId))
        return false;
    var interactionGr = new GlideRecord('interaction');
    return interactionGr.get(interactionId) && interactionGr.canRead() && interactionGr.canCreate();
}
