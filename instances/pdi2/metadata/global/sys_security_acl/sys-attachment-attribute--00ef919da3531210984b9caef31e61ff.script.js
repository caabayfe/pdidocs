answer = getAttributeCreateAnswer();

function getAttributeCreateAnswer() {
    var gr = new GlideRecord('sys_attachment');
    if (!gr.get(current.sys_attachment))
        return false;

	if(gs.hasRole('maint')) return true;
    return current.sys_attachment.getRefRecord().canCreate();
}
