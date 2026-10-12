function transform(input) {
    var setSemanticSearchBooleanValue = input.setSemanticSearch;
    if (typeof setSemanticSearchBooleanValue === 'string') {
        return setSemanticSearchBooleanValue.trim().toLowerCase() === 'true';
    }
    return setSemanticSearchBooleanValue ;
}
