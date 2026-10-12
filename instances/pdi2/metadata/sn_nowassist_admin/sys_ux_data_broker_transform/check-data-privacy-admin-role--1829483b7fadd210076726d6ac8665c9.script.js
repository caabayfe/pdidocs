function transform(input) {
    try {
        return NAARoleUtil._hasRole('now_assist_data_privacy_admin');
    } catch {
        gs.error("Now Assist Check data privacy admin role: Could not fetch role ");
        return false;
    }

}
