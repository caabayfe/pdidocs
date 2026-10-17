if (shouldChangeState())
    current.state = "DRAFT";

function shouldChangeState() {
    return (current.state != "NEW" && (current.active.changes() ||
        current.dictionary.changes() ||
        current.term.changes() ||
        current.payload.changes()));
}
