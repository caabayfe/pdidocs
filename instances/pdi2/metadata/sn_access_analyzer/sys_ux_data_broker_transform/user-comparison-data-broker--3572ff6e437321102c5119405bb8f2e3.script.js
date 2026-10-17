function transform(input) {
	const aaUtil = new sn_access_analyzer.AccessAnalyzerUtil();
    const Methods = {
		getRoleMap: (params) => aaUtil.getRoleMap(params)
    };

    return {
        request: input.req,
        response: Methods[input.req.method](input.req)
    };

}
