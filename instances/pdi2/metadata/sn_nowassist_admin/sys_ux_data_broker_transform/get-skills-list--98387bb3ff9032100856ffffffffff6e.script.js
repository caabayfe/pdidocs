function transform(input) {
    try {
        const result = sn_nowassist_admin.NAAManageModelVersions.getLLMBasedSkills();
        return result;
    } catch (error) {
        gs.error("Error while getting non-compliant skills: " + error.toString());
        return result || [];
    }
}
