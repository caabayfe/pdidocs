function transform(input) {
    var result = new global.CPIARUtils().getResolutionConfigDetails(input.recordId);
    return result;
}
