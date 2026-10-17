(function executeRule(current, previous /*null when async*/ ) {

    var contentBlockGr = new GlideRecord('sn_ace_content_block');
    contentBlockGr.addQuery('ace_config', current.ace_config);
    contentBlockGr.addQuery('type', current.type);
    contentBlockGr.query();
    if (contentBlockGr.next() && contentBlockGr.canRead()) {
        gs.addInfoMessage(gs.getMessage('Search Config content block already exists'));
        current.setAbortAction(true);
    }

})(current, previous);
