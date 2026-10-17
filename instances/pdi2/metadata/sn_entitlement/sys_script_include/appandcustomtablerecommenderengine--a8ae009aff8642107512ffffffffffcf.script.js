var AppAndCustomTableRecommenderEngine = Class.create();

(function() {
    const licenseCustTableAllotmentDAO = new LicenseCustTableAllotmentDAO();

    // Setting constants here so that it does not change during execution.
    const FALLBACK_LICENSE_WEIGHT = AppAndCustomTableRecommenderConstants.getFallBackLicenseWeight();
    const DECAY = AppAndCustomTableRecommenderConstants.getDecay();
    const NUM_RECOMMENDATIONS = AppAndCustomTableRecommenderConstants.getNumRecommendations();
    const MAX_PASS_ITERATIONS = AppAndCustomTableRecommenderConstants.getMaxPassIterations();

    let DATA = null;

    let CUSTOM_TABLE_NAMES = [];
    let APP_ENGINE_SUBSCRIPTIONS = [];
    let PRIMARY_SUBSCRIPTIONS_MAP = {};


    // Holds the final licenses for all the tables
    // e.g. {
    //     tableName: [
    //         license1,
    //         license2,
    //     ]
    // }
    let TABLE_LICENSE_LOOKUP = {};

    // Holds the final license weight for all the tables
    // e.g. {
    //     tableName: [
    //         weight1,
    //         weight2,
    //     ]
    // }
    let TABLE_LICENSE_WEIGHT_LOOKUP = {};

    // Holds the reason type for license assignment
    // e.g. {
    //     tableName: [
    //         [                  <--- license1
    //             reasonType,    <--- reason1
    //             reasonType     <--- reason2
    //         ],
    //         [                  <--- license2
    //             reasonType,    <--- reason1
    //             reasonType,    <--- reason2
    //             reasonType     <--- reason3
    //         ]
    //     ];
    // }
    let TABLE_LICENSE_REASON_LOOKUP = {};

    // Holds the final license paths for all the tables
    // e.g. {
    //     tableName: [
    //         [                            <--- license1
    //             ['table1', 'table2'],    <--- path1
    //             ['table3', 'table4']     <--- path2
    //         ],
    //         [                            <--- license2
    //             ['table5', 'table6'],    <--- path1
    //             ['table7', 'table8'],    <--- path2
    //             ['table9', 'table10']    <--- path3
    //         ]
    //     ];
    // }
    let TABLE_LICENSE_PATH_LOOKUP = {};

    // Holds the tables and their related tables in hierarchical form
    let LINKED_TABLE_LOOKUP = {};


    // Resets all the variables before each run. Critical when
    // running on the node version, optional when on SM as
    // the scheduled job runs a new instance of script
    // include everytime.
    function resetGlobalVariables(fileName) {
        // Do not reset anything which you want to calculate over all files.
        DATA = null;
        TABLE_LICENSE_LOOKUP = {};
        TABLE_LICENSE_WEIGHT_LOOKUP = {};
        TABLE_LICENSE_PATH_LOOKUP = {};
        TABLE_LICENSE_REASON_LOOKUP = {};

        LINKED_TABLE_LOOKUP = {};
    }

    // If a table has an assigned license, then set it as the correct license.
    // We always take the customer assignment as the correct license.
    function handleAssignedLicenses() {
        for (const table of CUSTOM_TABLE_NAMES) {
            // don't redo tables that we have already resolved
            if (TABLE_LICENSE_LOOKUP[table]) continue;

            // Do not use hasAssignedLicense here since grandfathered licenses
            // will have the flag set to true but will have a license of null.
            const {
                assignedLicense
            } = DATA[table];
            if (assignedLicense) {
                TABLE_LICENSE_LOOKUP[table] = [assignedLicense];
                TABLE_LICENSE_WEIGHT_LOOKUP[table] = [
                    AppAndCustomTableRecommenderConstants.RELATION_DETAILS[
                        AppAndCustomTableRecommenderConstants.RELATION_CODES.assignment
                    ].weight
                ];
                TABLE_LICENSE_REASON_LOOKUP[table] = [
                    [AppAndCustomTableRecommenderConstants.REASONS.ASSIGNMENT]
                ];
                TABLE_LICENSE_PATH_LOOKUP[table] = [
                    [
                        [table]
                    ]
                ];
            }
        }
    }

    // Gets the strong license from either a license relation or a table relation.
    // If it's a license relation, then we simply add the license to the list.
    // If it's a table relation and that table has already resolved (i.e. via assignment
    // or handleStrongRelations iteration), then we copy all the licenses assigned to it.
    // We always keep track of what license or table has been processed to avoid duplicates.
    function getStrongLicenseFromRelation(table, depTable, entry, code, weight, seenLicenses, seenTableLicenses) {
        const strongLicenseEntries = [];
        if (entry.license) {
            if (seenLicenses[entry.license]) {
                // The license already exists, and the source of the license
                // is the same (i.e. the table itself), so we can ignore it
                return strongLicenseEntries;
            }

            seenLicenses[entry.license] = true;

            // The license entry is present because the table is related to
            // a ServiceNow OOTB table or the custom tables scope or package
            // was found in ua_app_family table.
            const path = [table];

            if (depTable && !DATA[depTable]) {
                // This table is not on custom relations, so it has to be
                // a ServiceNow OOTB table. Only happens for extension relations.
                path.push(depTable);
            }

            strongLicenseEntries.push({
                code,
                license: entry.license,
                path,
                weight
            });
        } else if (depTable && TABLE_LICENSE_LOOKUP[depTable]) {
            // There is a related custom table with one or more licenses in it.
            TABLE_LICENSE_LOOKUP[depTable].forEach((license, idx) => {
                const key = `${depTable}__${license}`;
                if (seenTableLicenses[key]) {
                    return;
                }
                seenTableLicenses[key] = true;

                // All the paths have to be length 1 since only
                // assigned licenses have been processed at this point.
                const path = TABLE_LICENSE_PATH_LOOKUP[depTable][idx][0];
                const entry = {
                    code,
                    license,
                    path: [table],
                    weight
                };
                entry.path = entry.path.concat(path);
                strongLicenseEntries.push(entry);
            });
        }

        return strongLicenseEntries;
    }

    // Find licenses which cross the threshold in a single relation.
    // If a strong license is found, then we should recommend it
    // regardless of what happens with weak license weights.
    // This will only be true for extensions and subscriptions right now.
    function findStrongLicenses(table, relatedLicensesAndTables) {
        const seenLicenses = {};
        const seenTableLicenses = {};
        let allStrongLicenseEntries = [];
        for (const entry of relatedLicensesAndTables) {
            const depTable = entry.table;
            const code = entry.source.code;
            const weight = AppAndCustomTableRecommenderConstants.RELATION_DETAILS[code].weight;
            let strongLicenseEntries = [];

            if (weight > AppAndCustomTableRecommenderConstants.LICENSE_THRESHOLD) {
                strongLicenseEntries = getStrongLicenseFromRelation(table, depTable, entry, code, weight, seenLicenses, seenTableLicenses);
            }

            // Add the found strong licenses into
            allStrongLicenseEntries = allStrongLicenseEntries.concat(strongLicenseEntries);
        }

        return allStrongLicenseEntries;
    }

    // Sets the strong licenses found for the table
    function setStrongLicenseForTable(table, licensesCrossingThreshold) {
        TABLE_LICENSE_LOOKUP[table] = licensesCrossingThreshold.map(
            (val) => val.license
        );

        TABLE_LICENSE_REASON_LOOKUP[table] = licensesCrossingThreshold.map((val) => {
            if (val.code === 1) {
                return [AppAndCustomTableRecommenderConstants.REASONS.SUBSCRIPTION];
            } else if (val.code === 2) {
                return [AppAndCustomTableRecommenderConstants.REASONS.EXTENDS];
            }
        });

        TABLE_LICENSE_WEIGHT_LOOKUP[table] = licensesCrossingThreshold.map(
            (val) => val.weight
        );

        TABLE_LICENSE_PATH_LOOKUP[table] = licensesCrossingThreshold.map((val) => [
            val.path
        ]);
    }

    // Handle the strong licenses in the graph. If there are multiple
    // strong licenses, then we will be recommending all of them.
    function handleStrongRelations() {
        let iteration = 0;
        let changeDetected = false;

        // Loop over the graph propagating all strong license relations.
        // Iterate till we see no changes in the graph or if we hit the max iteration limit.
        do {
            iteration++;
            changeDetected = false;

            for (const table of CUSTOM_TABLE_NAMES) {
                // don't redo tables that we have already resolved
                if (TABLE_LICENSE_LOOKUP[table]) continue;

                const {
                    relatedLicensesAndTables
                } = DATA[table];

                const licensesCrossingThreshold = findStrongLicenses(
                    table,
                    relatedLicensesAndTables
                );

                // Sorting so that lexically ahead subscriptions are prioritized.
                // We don't care about weight here since all of them will have
                // the weight LICENSE_THRESHOLD + 1
                licensesCrossingThreshold.sort((a, b) => a.license <= b.license ? -1 : 1);

                // Limit the recommendations to NUM_RECOMMENDATIONS
                licensesCrossingThreshold.splice(
                    NUM_RECOMMENDATIONS,
                    Infinity
                );

                // This will only be true if it's a subscription or an extension
                // since only they have weights to cross license thresholds
                if (licensesCrossingThreshold.length) {
                    // We found a change, so we will set the changeDetected flag
                    changeDetected = true;
                    setStrongLicenseForTable(table, licensesCrossingThreshold);
                }
            }
        } while (
            changeDetected &&
            iteration < MAX_PASS_ITERATIONS);

        // We were unable to converge in MAX_PASS_ITERATIONS
        // This should ideally never happen, but 100 iterations
        // is reasonably good enough.
        if (iteration === MAX_PASS_ITERATIONS) {
            gs.error("AppAndCustomTableRecommenderEngine : Max iterations has been hit for handleStrongRelations.");
        }
    }

    // Creates and sets the relations (aka edges/links) on the graph.
    function setTableInfoOnLinkedTableLookup(table, filteredTables) {
        for (const entry of filteredTables) {
            const relatedTable = entry.table;
            const code = entry.source.code;
            const weight = AppAndCustomTableRecommenderConstants.RELATION_DETAILS[code].weight;

            if (LINKED_TABLE_LOOKUP[table].info[relatedTable]) {
                // Multiple references to the same table
                LINKED_TABLE_LOOKUP[table].info[relatedTable].weight += weight;
            } else {
                // New linked table found
                LINKED_TABLE_LOOKUP[table].info[relatedTable] = {
                    weight
                };
                LINKED_TABLE_LOOKUP[table].relatedTables.push(relatedTable);
            }
        }
    }

    // Creates and sets the licenseMap for a table.
    // The licenseMap contains all the licenses which exist on the table.
    // These licenses exist because the table is in a package or scope or
    // it extends a table (custom or OOTB) which is in the package or scope.
    // If there are duplicates, then they are merged into one.
    function setLicenseMapOnLinkedTableLookup(table, filteredLicenses) {
        for (const entry of filteredLicenses) {
            const license = entry.license;
            const code = entry.source.code;
            const weight = AppAndCustomTableRecommenderConstants.RELATION_DETAILS[code].weight;

            // License Map key should not be impacted by decay.
            // This ensures that we can uniquely identify a license.
            const key = `${table}__${license}__${weight}`;

            if (key in LINKED_TABLE_LOOKUP[table].licenseMap) {
                // The same license exists multiple times on a table
                LINKED_TABLE_LOOKUP[table].licenseMap[key].weight += weight;
            } else {
                // New license found
                LINKED_TABLE_LOOKUP[table].licenseMap[key] = {
                    table,
                    license,
                    weight,
                    path: [table]
                };
            }
        }
    }

    // Creates the graph for processing during weak relation iterations.
    function setupLinkedTablesLookup() {
        for (const table of CUSTOM_TABLE_NAMES) {
            LINKED_TABLE_LOOKUP[table] = LINKED_TABLE_LOOKUP[table] || {
                // Detailed info about relations for the table
                info: {},
                // List of all tables that are related to this table
                // We use this for looping purposes.
                relatedTables: [],
                // Detailed info about licenses on the table
                licenseMap: {}
            };
            const {
                relatedLicensesAndTables
            } = DATA[table];

            const filteredTables = relatedLicensesAndTables.filter((rl) => !("license" in rl));

            const filteredLicenses = relatedLicensesAndTables.filter((rl) => ("license" in rl));

            if (filteredTables.length) {
                setTableInfoOnLinkedTableLookup(table, filteredTables);
            }

            if (filteredLicenses.length) {
                setLicenseMapOnLinkedTableLookup(table, filteredLicenses);
            }

            // Table Info and Related Tables should never change after this
            Object.freeze(LINKED_TABLE_LOOKUP[table].info);
            Object.freeze(LINKED_TABLE_LOOKUP[table].relatedTables);
        }

        // No new tables can be added in the graph anymore.
        Object.freeze(LINKED_TABLE_LOOKUP);
    }

    // Gets licenseMap for tables which were resolved in handleAssignedLicenses
    // or in handleStrongRelations.
    function getLicenseMapForResolvedTable(depTable, relationWeight) {
        let depLicenseMap = {};
        TABLE_LICENSE_LOOKUP[depTable].forEach((license, idx) => {
            const allPaths = TABLE_LICENSE_PATH_LOOKUP[depTable][idx];
            allPaths.forEach((path) => {
                // We need to use the table which was the original source
                // of the license, this could be depTable itself
                // or a ServiceNow OOTB (only for extensions)
                const lastTable = path[path.length - 1];
                // License Map keys should not be impacted by decay.
                // This ensures that we can uniquely identify a license.
                const key = `${lastTable}__${license}__${relationWeight}`;
                depLicenseMap[key] = {
                    table: depTable,
                    license,
                    path
                };
            });
        });

        return depLicenseMap;
    }

    // Merges related table's licenseMap into self.
    function mergeLicenseMapInTable(table, depLicenseMap, weight) {
        let mapChangeDetected = false;
        for (let licenseEntry of Object.keys(depLicenseMap)) {
            if (!(licenseEntry in LINKED_TABLE_LOOKUP[table].licenseMap)) {
                // New license was detected
                mapChangeDetected = true;
                const entry = {
                    license: depLicenseMap[licenseEntry].license,
                    weight,
                    path: [table]
                };
                entry.path = entry.path.concat(depLicenseMap[licenseEntry].path);

                // Copy the dependent table's license to self.
                LINKED_TABLE_LOOKUP[table].licenseMap[licenseEntry] = entry;
            }
        }

        return mapChangeDetected;
    }

    // Handle the strong licenses in the graph. If there are multiple
    // weak licenses, then we will recommend all the ones which have the max weight.
    function handleWeakRelations() {
        const linkedTables = Object.keys(LINKED_TABLE_LOOKUP);
        let iteration = 0;
        let changeDetected = false;
        let decayMultiplier = 1;

        // Loop over the graph propagating all license relations.
        // Iterate till we see no changes in the graph or if we hit the max iteration limit.
        do {
            if (decayMultiplier <= 0) {
                // Decay has reduced all weights to zero, so we can stop now.
                break;
            }

            iteration++;
            changeDetected = false;

            for (const table of linkedTables) {
                for (const depTable of LINKED_TABLE_LOOKUP[table].relatedTables) {
                    let relationWeight = LINKED_TABLE_LOOKUP[table].info[depTable].weight;
                    let depLicenseMap = {};

                    if (TABLE_LICENSE_LOOKUP[depTable]) {
                        depLicenseMap = getLicenseMapForResolvedTable(
                            depTable,
                            relationWeight
                        );
                    } else {
                        depLicenseMap = LINKED_TABLE_LOOKUP[depTable].licenseMap;
                    }

                    // mapChangeDetected is used to figure out if the licenseMap changed due to mergeLicenseMapInTable
                    const mapChangeDetected = mergeLicenseMapInTable(
                        table,
                        depLicenseMap,
                        Math.floor(relationWeight * decayMultiplier)
                    );

                    // If there was a change, then changeDetected will be set to true for this iteration,
                    // signaling that convergence has not reached, and we need to continue iterating.
                    changeDetected = changeDetected || mapChangeDetected;
                }
            }
            decayMultiplier = decayMultiplier - DECAY;
        } while (
            changeDetected &&
            iteration < MAX_PASS_ITERATIONS
        );

        // We were unable to converge in MAX_PASS_ITERATIONS
        // This should ideally never happen, but 100 iterations
        // is reasonably good enough.
        if (iteration === MAX_PASS_ITERATIONS) {
            gs.error("AppAndCustomTableRecommenderEngine : Max iterations has been hit for handleWeakRelations.");
        }
    }


    // Creates a lookup of licenses for the table
    function setLicenseCandidates(candidates = {}, license, weight) {
        if (!candidates[license]) {
            // New license was found
            candidates[license] = 0;
        }

        candidates[license] += weight;
    }

    // Sets the licenses in their order of weights. Will limit the number of licenses
    // based on the NUM_RECOMMENDATIONS value.
    function setBestFitLicenses(table, licenseCandidates) {
        const maxLicenses = Array(NUM_RECOMMENDATIONS).fill(
            null
        );
        const maxWeights = Array(NUM_RECOMMENDATIONS).fill(
            -Infinity
        );

        // Set the first element to App Engine, if there are better options, then
        // this license will eventually be evicted
        maxLicenses[0] = AppAndCustomTableRecommenderConstants.FALLBACK_LICENSE;
        maxWeights[0] = FALLBACK_LICENSE_WEIGHT;

        for (const [licenseCandidate, licenseWeight] of Object.entries(
                licenseCandidates
            )) {
            for (let i = 0; i < NUM_RECOMMENDATIONS; i++) {
                // We have found a license with higher weight than one in our list
                // or the license has equal weight but is lexically ahead.
                // So we need to add it to the current spot and move others to the right
                if (licenseWeight > maxWeights[i] || (licenseWeight === maxWeights[i] && licenseCandidate < maxLicenses[i])) {
                    // We have found a license better than one in our list, so we
                    // need to add it to the current spot and move others to the right
                    maxLicenses.splice(i, 0, licenseCandidate);
                    maxWeights.splice(i, 0, licenseWeight);
                    break;
                }
            }
        }

        // Remove anything after NUM_RECOMMENDATIONS recommendations
        maxLicenses.splice(NUM_RECOMMENDATIONS, Infinity);
        maxWeights.splice(NUM_RECOMMENDATIONS, Infinity);

        // Remove unallocated entries from the Array.
        for (let i = 0; i < NUM_RECOMMENDATIONS; i++) {
            if (maxLicenses[i] === null) {
                maxLicenses.splice(i, Infinity);
                maxWeights.splice(i, Infinity);
                break;
            }
        }

        // Set the licenses on TABLE_LICENSE_LOOKUP
        TABLE_LICENSE_LOOKUP[table] = maxLicenses;
        TABLE_LICENSE_WEIGHT_LOOKUP[table] = maxWeights;

        return {
            maxLicenses,
            maxWeights
        };
    }

    // Calculates and Sets the path for the best licenses found in setBestFitLicenses
    function setBestFitPaths(table, licenseMap, maxLicenses, maxWeights) {
        const bestFitPaths = [];
        const bestReasons = [];

        // This lookup ensures that we do not use the same ServiceNow table as the endpoint
        // all the time. This will force the process to choose a new one for each path.
        let relatedLicensesAndTablesLookup = {};

        for (let [idx, license] of maxLicenses.entries()) {
            const paths = [];
            const reasons = [];

            if (license === AppAndCustomTableRecommenderConstants.FALLBACK_LICENSE) {
                // Default was selected, so there is path association required
                bestReasons.push([AppAndCustomTableRecommenderConstants.REASONS.DEFAULT]);
                bestFitPaths.push([]);
                continue;
            }

            for (const value of Object.values(licenseMap)) {
                if (value.license === license) {
                    const path = value.path;
                    const lastTable = path[path.length - 1];
                    const secondLastTable = path[path.length - 1];

                    if (!DATA[lastTable]) {
                        // The last table is a ServiceNow table, so we
                        // don't need to modify anything on this path.
                        // This happens due to handleStrongRelations() function
                        // which pushes the required ServiceNow table

                        reasons.push(AppAndCustomTableRecommenderConstants.REASONS.RELATION_OOTB);
                    } else if (lastTable !== secondLastTable && DATA[lastTable] && !DATA[lastTable].assignedLicense) {
                        // There is no assigned license on the last table in path, so this is not
                        // the end of the path and should link to a OOTB table.
                        const {
                            relatedLicensesAndTables
                        } = DATA[lastTable];

                        // Create a copy of relations so that we can mutate it.
                        if (!relatedLicensesAndTablesLookup[lastTable]) {
                            relatedLicensesAndTablesLookup[lastTable] = JSON.parse(
                                JSON.stringify(relatedLicensesAndTables)
                            );
                        }

                        let foundEntry = null;

                        // Find the relation that gave us this license.
                        for (let entry of relatedLicensesAndTablesLookup[lastTable]) {
                            if (entry.license === license && !entry.used) {
                                foundEntry = entry;
                                break;
                            }
                        }

                        // Mark the related as used so that others will be selected in
                        // the next iteration. For instance if two subscriptions were
                        // added by a table, then the first path will take the
                        // first subscription relation and the second
                        // path will take the second subscription relation.
                        if (foundEntry) {
                            foundEntry.used = true;
                            path.push(foundEntry.table);
                        }

                        reasons.push(AppAndCustomTableRecommenderConstants.REASONS.RELATION_OOTB);
                    } else {
                        // There is an assigned license on the last table in path, or the table is the
                        // last table on the path (happens for subscription  case) so the last
                        // table is the source of the license.

                        reasons.push(AppAndCustomTableRecommenderConstants.REASONS.RELATION_CUSTOM);
                    }

                    paths.push(value.path);
                }
            }

            bestReasons.push(reasons);
            bestFitPaths.push(paths);
        }

        TABLE_LICENSE_PATH_LOOKUP[table] = bestFitPaths;
        TABLE_LICENSE_REASON_LOOKUP[table] = bestReasons;

        return bestFitPaths;
    }

    function setBestFitLicensesAndPaths() {
        const tables = Object.keys(LINKED_TABLE_LOOKUP);
        for (const table of tables) {
            if (TABLE_LICENSE_LOOKUP[table]) continue;

            const licenseCandidates = {};
            const licenseMap = LINKED_TABLE_LOOKUP[table].licenseMap;

            for (const key of Object.keys(licenseMap)) {
                setLicenseCandidates(
                    licenseCandidates,
                    licenseMap[key].license,
                    licenseMap[key].weight
                );
            }

            const {
                maxLicenses,
                maxWeights
            } = setBestFitLicenses(
                table,
                licenseCandidates
            );

            const bestFitPaths = setBestFitPaths(
                table,
                LINKED_TABLE_LOOKUP[table].licenseMap,
                maxLicenses,
                maxWeights
            );

            LINKED_TABLE_LOOKUP[table].maxLicenses = maxLicenses;
            LINKED_TABLE_LOOKUP[table].maxWeights = maxWeights;
            LINKED_TABLE_LOOKUP[table].bestFitPaths = bestFitPaths;
        }
    }

    function getReasonMessage(isApp, reason, msgParams) {
        if (isApp) {
            switch (reason) {
                case AppAndCustomTableRecommenderConstants.REASONS.DEFAULT:
                    return gs.getMessage("One or more custom tables in this application aren't associated with other tables or applications that are mapped to a subscription. The application should be mapped to an App Engine subscription.");
                case AppAndCustomTableRecommenderConstants.REASONS.SUBSCRIPTION:
                    return gs.getMessage("The custom tables in this application belong to an app scope or package that is associated with the recommended subscription.");
                case AppAndCustomTableRecommenderConstants.REASONS.EXTENDS:
                    return gs.getMessage("One or more custom tables in this application extend table ({0}), which is mapped to the recommended subscription.", msgParams);
                case AppAndCustomTableRecommenderConstants.REASONS.RELATION:
                    return gs.getMessage("This subscription is recommended based on the following {0} relationships: ", msgParams);
                case AppAndCustomTableRecommenderConstants.REASONS.RELATION_OOTB:
                    return gs.getMessage(
                        "One or more custom tables in this application are related to an out-of-the-box ServiceNow table ({0}), which is associated with the recommended subscription through the following path: {1}",
                        msgParams
                    );
                case AppAndCustomTableRecommenderConstants.REASONS.RELATION_CUSTOM:
                    return gs.getMessage(
                        "One or more custom tables in this application are related to custom table {0}, which is associated to the recommended subscription through the following path: {1}",
                        msgParams
                    );
                default:
                    gs.error("AppAndCustomTableRecommenderEngine : Invalid reason detected in getReasonMessage : " + reason);
            }
        } else {
            switch (reason) {
                case AppAndCustomTableRecommenderConstants.REASONS.DEFAULT:
                    return gs.getMessage("This custom table isn't associated with other tables or applications that are mapped to a subscription. The table should be mapped to an App Engine subscription.");
                case AppAndCustomTableRecommenderConstants.REASONS.SUBSCRIPTION:
                    return gs.getMessage("This table belongs to an app scope or package that is associated with the recommended subscription.");
                case AppAndCustomTableRecommenderConstants.REASONS.EXTENDS:
                    return gs.getMessage("This table extends table ({0}), which is mapped to the recommended subscription.", msgParams);
                case AppAndCustomTableRecommenderConstants.REASONS.RELATION:
                    return gs.getMessage("This subscription is recommended based on the following {0} relationships:", msgParams);
                case AppAndCustomTableRecommenderConstants.REASONS.RELATION_OOTB:
                    return gs.getMessage(
                        "This table is related to an out-of-the-box ServiceNow table ({0}), which is associated with the recommended subscription through the following path: {1}",
                        msgParams
                    );
                case AppAndCustomTableRecommenderConstants.REASONS.RELATION_CUSTOM:
                    return gs.getMessage(
                        "This table is related to custom table {0}, which is associated to the recommended subscription through the following path: {1}",
                        msgParams
                    );
                default:
                    gs.error("AppAndCustomTableRecommenderEngine : Invalid reason detected in getReasonMessage : " + reason);
            }
        }

        return "";
    }

    function getCustomerReasonMessage(isApp, reason, msgParams) {
        if (isApp) {
            return getCustomerAppReasonMessage(reason, msgParams);
        } else {
            return getCustomerCustomTableReasonMessage(reason, msgParams);
        }
    }

    function getCustomerAppReasonMessage(reason, msgParams) {
        switch (reason) {
            case AppAndCustomTableRecommenderConstants.REASONS.DEFAULT:
                return gs.getMessage("This application is not associated with any product subscription with custom table use rights");
            case AppAndCustomTableRecommenderConstants.REASONS.SUBSCRIPTION:
                return gs.getMessage("The custom tables in this application belong to an app scope or package that is included with the recommended product subscription");
            case AppAndCustomTableRecommenderConstants.REASONS.EXTENDS:
                return gs.getMessage("One or more tables in this application extend table ({0}), which is mapped to the recommended product subscription", msgParams);
            case AppAndCustomTableRecommenderConstants.REASONS.RELATION:
                return gs.getMessage("This product subscription is recommended based on multiple relationships that this application has with the product subscription", msgParams);
            case AppAndCustomTableRecommenderConstants.REASONS.RELATION_OOTB:
                return gs.getMessage(
                    "", //this is intentionally an empty string as we will output no information for the list of relationships to the customer facing message at this time
                    msgParams
                );
            case AppAndCustomTableRecommenderConstants.REASONS.RELATION_CUSTOM:
                return gs.getMessage(
                    "", //this is intentionally an empty string as we will output no information for the list of relationships to the customer facing message at this time
                    msgParams
                );
            default:
                gs.error("AppAndCustomTableRecommenderEngine : Invalid reason detected in getReasonMessage : " + reason);

                return "";
        }
    }

    function getCustomerCustomTableReasonMessage(reason, msgParams) {
        switch (reason) {
            case AppAndCustomTableRecommenderConstants.REASONS.DEFAULT:
                return gs.getMessage("This table is not associated with any product subscription with custom table use rights");
            case AppAndCustomTableRecommenderConstants.REASONS.SUBSCRIPTION:
                return gs.getMessage("This table belongs to an app scope or package that is associated with the recommended product subscription");
            case AppAndCustomTableRecommenderConstants.REASONS.EXTENDS:
                return gs.getMessage("This table extends ({0}), which is currently mapped to the product subscription", msgParams);
            case AppAndCustomTableRecommenderConstants.REASONS.RELATION:
                return gs.getMessage("This product subscription is recommended based on multiple relationships that this table has with the product subscription", msgParams);
            case AppAndCustomTableRecommenderConstants.REASONS.RELATION_OOTB:
                return gs.getMessage(
                    "", //this is intentionally an empty string as we will output no information for the list of relationships to the customer facing message at this time
                    msgParams
                );
            case AppAndCustomTableRecommenderConstants.REASONS.RELATION_CUSTOM:
                return gs.getMessage(
                    "", //this is intentionally an empty string as we will output no information for the list of relationships to the customer facing message at this time
                    msgParams
                );
            default:
                gs.error("AppAndCustomTableRecommenderEngine : Invalid reason detected in getReasonMessage : " + reason);

                return "";
        }
    }

    function getReasonText(table, idx, getMessageFunction) {
        let reasonObj = {
            main: "",
            details: {}
        };

        // If data is not available, then return an empty object.
        // This should never happen and is here for safety.
        if (table === null || idx === null) {
            return reasonObj;
        }

        const {
            appSysId
        } = DATA[table];

        const isApp = appSysId !== 'global';

        const reasons = TABLE_LICENSE_REASON_LOOKUP[table][idx];
        const paths = TABLE_LICENSE_PATH_LOOKUP[table][idx];

        for (let j = 0; j < reasons.length; j++) {
            let reason = reasons[j];
            if (reason === AppAndCustomTableRecommenderConstants.REASONS.DEFAULT) {
                // No licenses were available in the graph, so we have defaulted to App Engine
                reasonObj.main = getMessageFunction(isApp, reason);
            } else if (reason === AppAndCustomTableRecommenderConstants.REASONS.SUBSCRIPTION) {
                // The custom table is created in a package or a scope which has a subscription
                reasonObj.main = getMessageFunction(isApp, reason);
            } else if (reason === AppAndCustomTableRecommenderConstants.REASONS.EXTENDS) {
                // The custom table extends a table with the required license
                const path = paths[j];
                const extendingTable = path[path.length - 1];
                reasonObj.main = getMessageFunction(isApp, reason, [extendingTable]);
            } else if (reason === AppAndCustomTableRecommenderConstants.REASONS.RELATION_OOTB || reason === AppAndCustomTableRecommenderConstants.REASONS.RELATION_CUSTOM) {
                // The license for the table came from one of the relations
                let pathMap = {};


                // Remove the last table if it's a duplicate. This can only happen
                // in a subscription relation since the table will be a source of license
                // for itself. The length will always be more than 1, just adding a
                // condition here to be safe.
                const size = paths.length;
                if (size > 1 && paths[size - 1] === paths[size - 2]) {
                    paths.pop();
                }

                for (let k = 0; k < paths.length; k++) {
                    const arrowPath = paths[k].join(" -> ");
                    if (!(arrowPath in pathMap)) {
                        pathMap[arrowPath] = k;
                    }
                }

                let pathMapKeys = Object.keys(pathMap);
                reasonObj.main = getMessageFunction(isApp, AppAndCustomTableRecommenderConstants.REASONS.RELATION, [pathMapKeys.length]);

                for (let i = 0; i < pathMapKeys.length; i++) {
                    let idx = pathMap[pathMapKeys[i]];
                    const arrowPath = pathMapKeys[i];
                    const lastTable = paths[idx][paths[idx].length - 1];
                    reasonObj.details[i + 1] = getMessageFunction(isApp, reason, [lastTable, arrowPath]);
                }
            }
        }

        return reasonObj;
    }

    function mergeData() {
        let result = {};
        for (let table of CUSTOM_TABLE_NAMES) {
            result[table] = {};
            result[table].licenses = TABLE_LICENSE_LOOKUP[table];
            result[table].weights = TABLE_LICENSE_WEIGHT_LOOKUP[table];
            result[table].paths = TABLE_LICENSE_PATH_LOOKUP[table];
            result[table].reasons = TABLE_LICENSE_REASON_LOOKUP[table];
        }

        return result;
    }

    // Adds a table to the entry if it's missing.
    // Adds a license to the entry if it's missing.
    // This will do nothing if AppAndCustomTableRecommenderScraper returns all the required data correctly.
    function handleMissingServiceNowData(customTableRelations) {
        for (let table of Object.keys(customTableRelations)) {
            const {
                relatedLicensesAndTables
            } = customTableRelations[table];
            for (let rl of relatedLicensesAndTables) {
                if ("license" in rl && !rl.license) {
                    // license key exists without a value
                    rl.license = AppAndCustomTableRecommenderConstants.MISSING_SUBSCRIPTION_NAME;
                    rl.table = AppAndCustomTableRecommenderConstants.MISSING_SERVICENOW_TABLE;
                } else if ("license" in rl && rl.license && !rl.table) {
                    // table is not set correctly. Either the key is missing
                    // or the table is empty.
                    rl.table = AppAndCustomTableRecommenderConstants.MISSING_SERVICENOW_TABLE;
                }
            }
        }
    }

    function calculateLicenses(customTableRelations, fileName = "") {
        // Resets all global variables
        resetGlobalVariables(fileName);

        // Hack the missing data for now, ideally this function should do nothing.
        handleMissingServiceNowData(customTableRelations);

        // Set the data on the global object, so that we don't have to pass it everywhere
        DATA = customTableRelations;
        Object.freeze(DATA);

        // Set the table names globally so that all functions can use them
        CUSTOM_TABLE_NAMES = Object.freeze(Object.keys(DATA));

        // Set licenses for tables where we have assigned licenses.
        handleAssignedLicenses();

        // Set licenses for tables where we have strong conviction
        // Currently limited to assignments, subscription and extensions
        handleStrongRelations();

        // Sets up LINKED_TABLE_LOOKUP lookup
        setupLinkedTablesLookup();

        // Find best fit licenses where we do not have strong relation
        handleWeakRelations();

        setBestFitLicensesAndPaths();

        return mergeData();
    }

    function getAppLicensesLookup(calculatedLicenses) {
        const appLicenseLookup = {};
        for (const table of CUSTOM_TABLE_NAMES) {
            const {
                appSysId,
                hasAssignedLicense
            } = DATA[table];
            if (appSysId === 'global' || hasAssignedLicense) {
                continue;
            }

            if (!appLicenseLookup[appSysId]) {
                appLicenseLookup[appSysId] = [];
            }
            appLicenseLookup[appSysId].push({
                table,
                calculatedLicense: calculatedLicenses[table]
            });
        }

        return appLicenseLookup;
    }

    function setupSubscriptionData() {
        const trimLicense = (license = '') => license.trim();

        const appEngineSubscriptions = licenseCustTableAllotmentDAO.getActiveSubscriptionsByAllotmentType(LicensingEngineDBConstants.ALLOTMENT_TYPE_APP_ENGINE);
        const primarySubscriptions = licenseCustTableAllotmentDAO.getAllActivePrimarySubscriptions();
        const primarySubscriptionLookup = primarySubscriptions.reduce((lookup, value) => ({
            ...lookup,
            [trimLicense(value.subscriptionName)]: value.subscriptionEntitlementId
        }), {});

        APP_ENGINE_SUBSCRIPTIONS = appEngineSubscriptions;
        PRIMARY_SUBSCRIPTIONS_MAP = primarySubscriptionLookup;
    }

    function getAppEngineRecommendations() {
        const recommendations = [];
        APP_ENGINE_SUBSCRIPTIONS.forEach(subscription => {
            recommendations.push({
                table: null,
                idx: null,
                subscriptionName: subscription.subscriptionName,
                subscriptionSysId: subscription.subscriptionEntitlementId,
                weight: FALLBACK_LICENSE_WEIGHT
            });
        });
        return recommendations;
    }

    function getTableRecommendations(table, seenLicenses, tableData, maxValue) {
        let licenses = tableData.licenses;
        let weights = tableData.weights;

        const recommendations = [];
        for (let i = 0; i < licenses.length; i++) {
            if (seenLicenses.has(licenses[i])) {
                // Multiple license entries on the table, so we
                // can skip them during recommendation.
                continue;
            }

            // Recommend only licenses with weight = maxValue
            if (weights[i] === maxValue) {
                seenLicenses.add(licenses[i]);

                if (licenses[i] === AppAndCustomTableRecommenderConstants.FALLBACK_LICENSE) {
                    APP_ENGINE_SUBSCRIPTIONS.forEach(subscription => {
                        recommendations.push({
                            table,
                            idx: i,
                            subscriptionName: subscription.subscriptionName,
                            subscriptionSysId: subscription.subscriptionEntitlementId,
                            weight: weights[i]
                        });
                    });
                } else {
                    if (PRIMARY_SUBSCRIPTIONS_MAP[licenses[i]]) {
                        recommendations.push({
                            table,
                            idx: i,
                            subscriptionName: licenses[i],
                            subscriptionSysId: PRIMARY_SUBSCRIPTIONS_MAP[licenses[i]],
                            weight: weights[i]
                        });
                    }
                }
            }
        }

        return recommendations;
    }

    function getGlobalCustomTableLicenseRecommendations(calculatedLicenses) {
        const appEngineSubscriptions = getAppEngineRecommendations();
        const globalCustomTableLicenseRecommendations = {};

        for (const table of CUSTOM_TABLE_NAMES) {
            const {
                appSysId,
                hasAssignedLicense
            } = DATA[table];
            if (appSysId !== 'global' || hasAssignedLicense) {
                continue;
            }

            const customTableInventorySysId = DATA[table].customTableInventorySysId;
            let weights = calculatedLicenses[table].weights;
            let maxValue = Math.max(...weights);

            let recommendations = getTableRecommendations(table, new Set(), calculatedLicenses[table], maxValue);

            // If recommendations is empty, then we should populate it with fallback option.
            // This should happen only for expired subscriptions when relation is
            // of type subscription (code 1).
            recommendations = recommendations.length ? recommendations : appEngineSubscriptions;

            globalCustomTableLicenseRecommendations[customTableInventorySysId] = recommendations;
        }

        return globalCustomTableLicenseRecommendations;
    }

    function getAppLicenseRecommendations(appLicenseLookup) {
        const appEngineSubscriptions = getAppEngineRecommendations();
        const appLicenseRecommendations = {};

        for (const appSysId of Object.keys(appLicenseLookup)) {
            if (appSysId === 'global') {
                continue;
            }
            let maxValue = -1;
            let recommendations = [];
            const seenLicenses = new Set();

            appLicenseLookup[appSysId].forEach(({
                calculatedLicense
            }) => {
                let weights = calculatedLicense.weights;
                maxValue = Math.max(maxValue, ...weights);
            });

            appLicenseLookup[appSysId].forEach(({
                table,
                calculatedLicense
            }) => {
                recommendations.push(...getTableRecommendations(table, seenLicenses, calculatedLicense, maxValue));
            });

            // Limit the recommendations to NUM_RECOMMENDATIONS
            // We need to do this here since we are combining multiple tables,
            // so sort and limiting have to be redone
            recommendations.sort((a, b) => a.subscriptionName <= b.subscriptionName ? -1 : 1);
            recommendations.splice(NUM_RECOMMENDATIONS, Infinity);

            // If recommendations is empty, then we should populate it with fallback option.
            // This should happen only for expired subscriptions when relation is
            // of type subscription (code 1).
            recommendations = recommendations.length ? recommendations : appEngineSubscriptions;

            appLicenseRecommendations[appSysId] = recommendations;
        }

        return appLicenseRecommendations;
    }

    function getRecommendLicenseForTables(customTableRelations) {
        setupSubscriptionData();

        const calculatedLicenses = calculateLicenses(customTableRelations);
        const appLicenseLookup = getAppLicensesLookup(calculatedLicenses);

        const globalCustomTableLicenseRecommendations = getGlobalCustomTableLicenseRecommendations(calculatedLicenses);
        const appLicenseRecommendations = getAppLicenseRecommendations(appLicenseLookup);

        return {
            calculatedLicenses,
            globalCustomTableLicenseRecommendations,
            appLicenseRecommendations
        };
    }

    AppAndCustomTableRecommenderEngine.getRecommendLicenseForTables = getRecommendLicenseForTables;
    AppAndCustomTableRecommenderEngine.getReasonText = getReasonText;
    AppAndCustomTableRecommenderEngine.getReasonMessage = getReasonMessage;
    AppAndCustomTableRecommenderEngine.getReasonText = getReasonText;
    AppAndCustomTableRecommenderEngine.getCustomerReasonMessage = getCustomerReasonMessage;


    AppAndCustomTableRecommenderEngine.prototype = {
        initialize: function() {
            throw 'Not supported';
        },
        type: 'AppAndCustomTableRecommenderEngine',
    };
})();
