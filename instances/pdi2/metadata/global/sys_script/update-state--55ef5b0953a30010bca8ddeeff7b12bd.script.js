if (shouldChangeState())
    current.state = "DRAFT";

function shouldChangeState() {
    return (current.state != "NEW" && (current.active.changes() ||
        current.description.changes() ||
        current.locale.changes() ||
        current.spellcheck_mode.changes() ||
        current.synonym_mode.changes() ||
        current.stop_word_mode.changes()));
}
