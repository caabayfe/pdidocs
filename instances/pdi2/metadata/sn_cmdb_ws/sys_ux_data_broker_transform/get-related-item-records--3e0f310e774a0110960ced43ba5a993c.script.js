function transform(input) {
    var result = {};
	result.errors = [];
    try {
        var helper = new UnifiedMapHelper();
		
        var tmpResult = helper.getRelatedItemData(input ? input.payload : {});
        if (tmpResult.success) {
            result.data = tmpResult.result;
        } else {
            //TODO: map with user-friendly error messages WRT tmpResult.error.code
            result.errors.push(tmpResult.error.message);
        }

    } catch (error) {
        result.errors.push(error.toString());
    }
    return result;
}
