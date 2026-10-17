function transform(input) {
    try {
        return {
            name: NAASkillFamilyUtil.getSkillFamilyName(input?.productId),
        };
    } catch (error) {
        gs.info("Error in getting product details : " + error.toString());
    }
}
