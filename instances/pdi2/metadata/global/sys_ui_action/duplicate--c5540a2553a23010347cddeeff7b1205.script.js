(function() {
    var escapedNameStr = GlideStringUtil.escapeHTML(current.name);
    gs.addInfoMessage(gs.getMessage('Duplicated {0} ({1})', [current.number, escapedNameStr]));
    var oldSysId = current.getUniqueValue();
    current.name = current.name + "_copy";
    current.number = '';
    var newSysId = current.insert();
    var msf = new MIDServerProfile();
    msf.clone(oldSysId, newSysId);
    action.setRedirectURL(current);
})();
