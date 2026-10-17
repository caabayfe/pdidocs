if (!pm.isZboot()) {
	GlideSysSemaphore.get().reload();
	GlideClusterMessage.post("script", "GlideSysSemaphore.get().reload();");
}
