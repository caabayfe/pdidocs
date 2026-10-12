if (shouldChangeState())
    current.state = "DRAFT";

function shouldChangeState() {
    return (current.state != "NEW" && (current.active.changes() ||
        current.type.changes() ||
        current.order.changes() ||
        current.promote_doc.changes() ||
        current.block_doc.changes() ||
        current.boost_number.changes() ||
        current.boost_field_name.changes() ||
        current.boost_value.changes() ||
        current.boost_context_field.changes() ||
        current.marked_for_deletion.changes()));
}
