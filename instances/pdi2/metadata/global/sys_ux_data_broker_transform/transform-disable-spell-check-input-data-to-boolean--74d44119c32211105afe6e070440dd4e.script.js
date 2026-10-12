function transform(input) {
    var disableSpellCheckBooleanValue = input.disableSpellCheck;
    if (typeof disableSpellCheckBooleanValue === 'string') {
        return disableSpellCheckBooleanValue.trim().toLowerCase() === 'true';
    }
    return disableSpellCheckBooleanValue ;
}
