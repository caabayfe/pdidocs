function transform(input) {
    var chg = input && input.chg ? ('' + input.chg).trim() : '';
    return { query: chg ? ('chg=' + chg) : '' };
}
