(function process( /*ResolverEnvironment*/ env) {
	var inputdata = env.getArguments().input;
    var table = inputdata.table;
    var sysId = inputdata.sysId;
    var primaryUser = inputdata.primaryUser;
    var primaryFields = inputdata.primaryFields;
    var secondaryUser = inputdata.secondaryUser;
    var secondaryFields = inputdata.secondaryFields;
    var tertiaryUser = inputdata.tertiaryUser;
    var tertiaryFields = inputdata.tertiaryFields;

    return new global.RibbonDataUtil().getCustomer360Data(table, sysId, primaryUser, primaryFields, secondaryUser, secondaryFields, tertiaryUser, tertiaryFields);
})(env);
