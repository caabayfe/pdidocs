function include({ imports }) {

    const _genericError = async (helpers) => {
    	const header = await helpers.translate("Something went wrong.");
    	const message = await helpers.translate("Enter query again.");
        return ({
            "type": "critical",
            "header": header,
            "message": message
        });
    };

    const _queryRunningWarning = async (helpers) => {
    	const header = await helpers.translate("Query already running.");
    	const message = await helpers.translate("Wait or cancel other query.");
        return ({
            "type": "warning",
            "header": header,
            "message": message
        });
    };

    const _invalidQueryError = async (helpers) => {
    	const header = await helpers.translate("Invalid query.");
    	const message = await helpers.translate("Go to Query Builder to fix it.");
        return ({
            "type": "critical",
            "header": header,
            "message": message
        });
    };

    const _saveNlqFeedbackError = async (helpers) => {
    	const header = await helpers.translate("Something went wrong.");
    	const message = await helpers.translate("Could not save feedback.");
        return ({
            "type": "critical",
            "header": header,
            "message": message
        });
    };

    const _cancelQueryError = async (helpers) => {
    	const header = await helpers.translate("Something went wrong.");
    	const message = await helpers.translate("Could not cancel query.");
        return ({
            "type": "critical",
            "header": header,
            "message": message
        });
    };

    return {
        genericError: _genericError,
        queryRunningWarning: _queryRunningWarning,
        invalidQueryError: _invalidQueryError,
        saveNlqFeedbackError: _saveNlqFeedbackError,
        cancelQueryError: _cancelQueryError
    };
}
