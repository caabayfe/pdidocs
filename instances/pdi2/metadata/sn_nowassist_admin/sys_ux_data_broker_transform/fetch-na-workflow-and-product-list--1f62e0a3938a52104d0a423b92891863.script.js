function transform(input) {
    var result = [];
    try {
        var util = new sn_nowassist_admin.SkillBuilderNaaUtils();
        result = util.getWorkflowsProductsFeatures('maint');
    } catch (error) {
        gs.error("Failed to get workflows, products and features" + error.toString());
    }
    return result;
}
