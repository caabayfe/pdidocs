function openProgressModal() {
    var modal = new GlideModal("view_domain_job_progress", false, "modal-md");
    modal.setTitle(new GwtMessage().getMessage("Domain Job Progress"));
    modal.setPreference('focusTrap', true);
    modal.render();
}
