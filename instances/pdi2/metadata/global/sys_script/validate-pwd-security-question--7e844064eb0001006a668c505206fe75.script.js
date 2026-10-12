trim();
filterDuplicate();

function filterDuplicate() {
    var gr = new GlideRecord("pwd_question");
    gr.addQuery("question_translated", current.question_translated);
    gr.addQuery("sys_domain", current.sys_domain);
    gr.addQuery("language", current.language);

    if (current.operation() == "update") {
        gr.addQuery("sys_id", "<>", current.sys_id);
    }

    gr.query();

    if (gr.next()) {
        var errMsg = gs.getMessage("The Question '{0}' is already in use. Enter a different question.", current.question_translated);
        gs.addErrorMessage(errMsg);
        current.setAbortAction(true);
    }
}

function trim() {
    current.question_translated = current.question_translated.trim();
    if (current.question_translated) {
        current.question_translated = GlideStringUtil.escapeHTML(current.question_translated);
    } else {
        gs.addErrorMessage(gs.getMessage("You must enter a Question."));
        current.setAbortAction(true);
    }
}
