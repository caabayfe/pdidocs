(function(current, action) {
    action.setRedirectURL(current);
    current.update();
    gs.include('ActionUtils');
    var au = new ActionUtils();
    au.postInsert(current);
})(current, action);
