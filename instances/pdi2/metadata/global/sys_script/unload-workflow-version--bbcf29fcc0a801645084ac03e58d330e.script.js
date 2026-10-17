// If the published flag has changed to 'published', we need to unload the workflow version
// If the version is now 'published', then we unload the version and all of its
//    related entries (activities, condition, transitions, stages)
//
// The unload is handled by the WorkflowVersionSynchronizer class.
//
gs.updateSave(current);
