(function executeRule(current, previous /*null when async*/ ) {
    if (current.props) {
        try {
            var properties = JSON.parse(current.props);

            if (properties.recenterThresholdPercentage) {
                var validIntRegex = /^\d+$/;
                var isThresholdValid = false;
                var threshold = properties.recenterThresholdPercentage;

                if (validIntRegex.test(threshold) && threshold >= 0 && threshold <= 100)
                    isThresholdValid = true;

                if (!isThresholdValid) {
                    gs.addErrorMessage(
                        gs.getMessage('Please enter an integer value between 0 and 100 for "{0}" key in the Properties field.', "recenterThresholdPercentage")
                    );
                    current.setAbortAction(true);
                }
            }
        } catch (ex) {
            gs.addErrorMessage(
                gs.getMessage('Please enter a valid JSON Object in the Properties field.')
            );
            current.setAbortAction(true);
        }
    }
})(current, previous);
