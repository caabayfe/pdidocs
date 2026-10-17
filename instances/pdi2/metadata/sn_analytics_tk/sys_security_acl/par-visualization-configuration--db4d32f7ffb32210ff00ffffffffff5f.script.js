// if visualization is shared with you, you can read the permission table or
// if you have write permission on the viz which means you have viz_admin role
answer = new global.VizACLUtil().isVizSharedWithMeOrIamOwner(current.par_component);
