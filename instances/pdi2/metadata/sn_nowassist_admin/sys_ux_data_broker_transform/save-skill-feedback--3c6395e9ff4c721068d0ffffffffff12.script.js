function transform(input) {
    try {
        const checklist = (Array.isArray(input.feedbackChecklist) ? input.feedbackChecklist : []).reduce((acc, item) => {
            const key = item?.itemId;
            if (key) {
                acc[key] = item?.checked ?? false; // default to false if null/undefined
            }
            return acc;
        }, {});
        NAAFeedbackUtil.saveSkillFeedback(gs.getUserID(), input.additionalFeedback, checklist, input.skillId);
    } catch (e) {
        gs.error("Failed to save skill feedback data - " + e.toString());
    }
}
