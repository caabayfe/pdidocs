var isTextSearchEnabled = gs.getProperty('glide.ui.text_search.enable', 'true');
answer = false;
if (isTextSearchEnabled === 'true') {
    var canSearchRoles = gs.getProperty('glide.ui.can_search');
    answer = gs.getSession().hasRole(canSearchRoles);
}
