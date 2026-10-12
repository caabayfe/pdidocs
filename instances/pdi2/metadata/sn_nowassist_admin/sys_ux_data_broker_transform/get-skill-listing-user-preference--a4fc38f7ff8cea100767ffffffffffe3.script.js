function transform(input) {
    try {
        return {
            gridViewSelected: gs.getUser().getPreference('gridViewSelected') === "false" ? false : true,
        };
    } catch (error) {
        gs.error("Error while fetching preference: " + error.toString());
        return {
            gridViewSelected: true,
        };
    }
}
