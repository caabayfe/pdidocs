function transform(input) {
    try {
        switch (input.keyName) {
            case 'gridViewSelected':
                gs.getUser().savePreference('gridViewSelected', input?.gridViewSelectedValue.toString());
                break;
            default:
                break;
        }
        return true;
    } catch (error) {
        gs.error("Error while saving preference: " + error.toString());
        return false;
    }
}
