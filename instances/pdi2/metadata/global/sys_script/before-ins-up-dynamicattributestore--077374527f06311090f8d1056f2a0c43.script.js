(function executeRule(current, previous /*null when async*/ ) {

    if (current.operation() == 'update' && current.internal_type != previous.internal_type) {
        gs.addErrorMessage(gs.getMessage(
            "Modifying the type of an element to or from 'Dynamic Attribute Store' is not allowed."
        ));
        current.setAbortAction(true);
        return;
    }

    if (current.dependent_on_field) {
        var ce = new GlideCompositeElement(current.dependent_on_field, current.name);
        if (ce.isValid()) {
            var internalType = ce.getTargetED().getInternalType();
            var reference = ce.getTargetED().getReference();

            if (internalType == "reference" && reference == "dynamic_category")
                return;
        }

        gs.addErrorMessage(gs.getMessage("'Dependent on field' must be a reference to a Dynamic Category."));
        current.setAbortAction(true);
    }

})(current, previous);
