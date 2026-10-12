(function executeRule(current, previous /*null when async*/ ) {

    if (current.isValidRecord() && current.icon) {
        var isError = false;
        var errorMsg = '';
        var isValidImage = (/\.(svg|png|jpg|jpeg|json)$/i.test(current.icon));
        var isValidIcon = (/^[a-zA-Z0-9]+(-[a-zA-Z0-9]+)*$/i.test(current.icon));
        if (current.icon_type == 'now_icon' && !isValidIcon) {
            isError = true;
            errorMsg = gs.getMessage("Enter a valid now-icon name without file extensions like .svg or .png.");
        } else if (current.icon_type == 'image' && !isValidImage) {
            isError = true;
            errorMsg = gs.getMessage("Enter an icon name from DB images with valid extensions (svg, png, jpg, jpeg, etc.).");
        }
        if (isError) {
            current.setAbortAction(true);
            gs.addErrorMessage(errorMsg);
        }
    }

})(current, previous);
