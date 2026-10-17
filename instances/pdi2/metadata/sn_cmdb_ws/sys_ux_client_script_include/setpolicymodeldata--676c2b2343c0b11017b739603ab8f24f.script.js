function include({imports}) {

    /**
     * 
     * @param elementName A element ideally in the format <sectionName>:<fieldName> but will accept <fieldName> only
     * @param updatedVal Value to set
     * @param policyData Policy data json
     * @returns Updated policy data json
     */
    const _setPolicyModelData = (elementName, updatedVal, policyData) => {

        let section, fieldName;
        if (elementName && elementName.includes(":")) {
            const nameArr = elementName.split(":");
            section = nameArr[0];
            fieldName = nameArr[1];
        } else {
            fieldName = elementName;
        }

        if (!section) {
            // search the policyData json for the correct key/value. policy data should only 2 levels deep.
            section = Object.keys(policyData).find((policyDataSection) => Object.values(policyDataSection).includes(fieldName));
            if (!section) {
                // Given field wasn't found on the model, print warning and return original policyData object 
                console.warn("Could not find fieldName in policy data for " + fieldName);
                return policyData;
            }
        }
        policyData[section][fieldName] = updatedVal;
        return policyData;
    }


    return {
        setPolicyModelData: _setPolicyModelData
    }
 }
