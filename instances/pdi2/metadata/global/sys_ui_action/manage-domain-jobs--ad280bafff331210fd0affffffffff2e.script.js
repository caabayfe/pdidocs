function manageDomainJobs() {
	var title = new GwtMessage().getMessage("Domain Job Manager");
	var dialog = new GlideModal('manage_domain_jobs');
	dialog.setTitle(title);
	dialog.render();
}
