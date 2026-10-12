(function executeRule(current, previous /*null when async*/ ) {
    gs.addErrorMessage(gs.getMessage("To be associated with an offering, a catalog item must belong to one of these categories: Catalog Item, Product Catalog Item, Hardware Catalog, Software Catalog, or Record Producer."));
    current.setAbortAction(true);

})(current, previous);
