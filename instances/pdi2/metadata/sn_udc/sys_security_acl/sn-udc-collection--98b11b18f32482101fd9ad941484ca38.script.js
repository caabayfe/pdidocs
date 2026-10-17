var bookmarksSysId = sn_udc.Collection.DEFAULT_BOOKMARKS_COLLECTION_ID;
// Bookmarks record — only actual maint system user can update
if (current.sys_id == bookmarksSysId) {
    answer = gs.getUserName() == 'maint';
}else {
    answer = current.creator == gs.getUserID() || gs.hasRole('sn_udc.admin');
}
