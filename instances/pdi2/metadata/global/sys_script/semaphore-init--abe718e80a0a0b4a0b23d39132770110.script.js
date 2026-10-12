GlideSysSemaphore.get().reload();
// send cluster message
GlideClusterMessage.post("script", "GlideSysSemaphore.get().reload();");
