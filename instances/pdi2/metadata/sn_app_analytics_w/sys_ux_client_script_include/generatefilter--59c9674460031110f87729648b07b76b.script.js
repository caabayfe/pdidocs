function include({ imports }) {

    const reloadListWithFilters = (stepValue, kpiSearchTerm, userName) => {

        let stateValues = { showBookmarked: false, filterCondition: '' };

        switch (stepValue) {
            case 'all':
                if (kpiSearchTerm)
                    stateValues['filterCondition'] = 'descriptionLIKE' + kpiSearchTerm + '^ORnameLIKE' + kpiSearchTerm;
                else
                    stateValues['filterCondition'] = '';
                break;
            case 'created_by_me':
                stateValues['showBookmarked'] = false;
                if (kpiSearchTerm)
                    stateValues['filterCondition'] = 'descriptionLIKE' + kpiSearchTerm + '^ORnameLIKE' + kpiSearchTerm + '^sys_created_by=' + userName;
                else
                    stateValues['filterCondition'] = 'sys_created_by=' + userName;
                break;
            case 'bookmarked':
                stateValues['showBookmarked'] = true;
                if (kpiSearchTerm)
                    stateValues['filterCondition'] = 'descriptionLIKE' + kpiSearchTerm + '^ORnameLIKE' + kpiSearchTerm;
                break;
         default:
                if (kpiSearchTerm)
                    stateValues['filterCondition'] = 'descriptionLIKE' + kpiSearchTerm + '^ORnameLIKE' + kpiSearchTerm;
        }

        return stateValues;
    }

    return {
        reloadListWithFilters
    }
}
