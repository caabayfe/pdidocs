var grs = new GlideRecordSecure('par_visualization');
grs.get(current.component);
// if visualization is shared with you, you can read the permission table or
// if you have write permission on the viz which means you have viz_admin role
answer = new global.VizDesignerUtil().isVizSharedWithMeOrIamOwner(current.component) || grs.canWrite();
