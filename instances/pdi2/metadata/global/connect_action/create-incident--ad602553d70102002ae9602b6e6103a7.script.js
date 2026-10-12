response.newRecord("incident", {
	short_description: conversation.document.short_description || "",
	caller_id: conversation.document.opened_by
});
