function transform(input) {
    try {
        var response = NAASkilConfigActivateToggler.deactivateNonComplaintSkills(input.skills);
        return response;
    } catch (error) {
        gs.error("Error while getting non complaint skills: " + error.toString());
        return false;
    }
}
