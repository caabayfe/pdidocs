function uploadAttachments() {
	if (typeof saveAttachment === "function" && typeof g_form !== "undefined")
		saveAttachment("sys_atf_step", g_form.getUniqueValue(), true);
}
