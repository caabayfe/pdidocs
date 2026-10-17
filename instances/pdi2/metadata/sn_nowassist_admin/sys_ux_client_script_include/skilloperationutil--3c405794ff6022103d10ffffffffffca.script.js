function include({imports
}) {
    class SkillOperationUtil {
        static applySearchAndFilter(allSkillData, dataObj) {
            // Fetch all data
            var skillCardData = allSkillData.skillData;
            var skillListData = allSkillData.presentationListRowPayload.rows;
            // Apply search
            skillCardData = dataObj.searchTerm.length != 0 ? skillCardData.filter(skill => skill.title.label.toLowerCase().includes(dataObj.searchTerm.toLowerCase())) : skillCardData;
            skillListData = dataObj.searchTerm.length != 0 ? skillListData.filter(skill => skill.cells.name.value.toLowerCase().includes(dataObj.searchTerm.toLowerCase())) : skillListData;
            // Apply filter on card data
            skillCardData = skillCardData.filter(skill => {
                const matchesProvider = dataObj.filter.filterProviderVal.length === 0 || dataObj.filter.filterProviderVal.some(filter => skill.skillProvider.includes(filter.id));
                const matchesState = dataObj.filter.filterStateVal.length === 0 || dataObj.filter.filterStateVal.some(filter => filter.id === skill.skillState);
                const matchesType = dataObj.filter.filterTypeVal.length === 0 || dataObj.filter.filterTypeVal.some(filter => filter.id === skill.skillType);
                const matchesFeature = dataObj.filter.filterFeatureVal.length === 0 || dataObj.filter.filterFeatureVal.some(filter => filter.id === skill.skillFamily);
                return matchesProvider && matchesState && matchesType && matchesFeature;
                });
            // Apply filter on list data
            skillListData = skillListData.filter(skill => {
                const matchesProvider = dataObj.filter.filterProviderVal.length === 0 || dataObj.filter.filterProviderVal.some(filter => skill.cells.llmProvider.value.includes(filter.id));
                const matchesState = dataObj.filter.filterStateVal.length === 0 || dataObj.filter.filterStateVal.some(filter => filter.id === skill.cells.state.value);
                const matchesType = dataObj.filter.filterTypeVal.length === 0 || dataObj.filter.filterTypeVal.some(filter => filter.id === skill.cells.skillType.value);
                const matchesFeature = dataObj.filter.filterFeatureVal.length === 0 || dataObj.filter.filterFeatureVal.some(filter => filter.id === skill.skillInfo.skillFamily);
                return matchesProvider && matchesState && matchesType && matchesFeature;
                });
            //since search and filters applied on allSkillData(data directly fetched using data broker), to preserve sorting we need apply sort as well
            return SkillOperationUtil.sortSkillData({ skillCardData, skillListData }, allSkillData, dataObj.sortBy);
        }
        static sortSkillData(filteredSkillData, allSkillData, sortBy = "none") {
            const { skillCardData, skillListData } = filteredSkillData;
            // Helper to access nested properties safely
            const getNestedValue = (obj, path) => {
                return path.split('.').reduce((acc, part) => acc && acc[part], obj);
            };
            // Sort by date with separate keys for card and list
            const sortByDate = (keyCard, keyList, order = "asc") => {
                const direction = order === "asc" ? 1 : -1;
                skillCardData.sort((a, b) =>
                    direction * (new Date(getNestedValue(a, keyCard)) - new Date(getNestedValue(b, keyCard)))
                );
                skillListData.sort((a, b) =>
                    direction * (new Date(getNestedValue(a, keyList)) - new Date(getNestedValue(b, keyList)))
                );
            };
            // Sort by text with separate keys for card and list
            const sortByText = (keyCard, keyList, order = "asc") => {
                const direction = order === "asc" ? 1 : -1;
                skillCardData.sort((a, b) => {
                    const aVal = getNestedValue(a, keyCard);
                    const bVal = getNestedValue(b, keyCard);
                    return direction * aVal.localeCompare(bVal);
                });
                skillListData.sort((a, b) => {
                    const aVal = getNestedValue(a, keyList);
                    const bVal = getNestedValue(b, keyList);
                    return direction * aVal.localeCompare(bVal);
                });
            };
            // Apply sorting based on sortBy value
            switch (sortBy) {
                case "last_updated_asc":
                    sortByDate("latest_sys_updates_on", "skillInfo.latest_sys_updates_on", "asc");
                    break;
                case "last_updated_desc":
                    sortByDate("latest_sys_updates_on", "skillInfo.latest_sys_updates_on", "desc");
                    break;
                case "recently_created_asc":
                    sortByDate("created_on", "skillInfo.created_on", "asc");
                    break;
                case "recently_created_desc":
                    sortByDate("created_on", "skillInfo.created_on", "desc");
                    break;
                case "a-z":
                    sortByText("title.label", "cells.name.value", "asc");
                    break;
                case "z-a":
                    sortByText("title.label", "cells.name.value", "desc");
                    break;
                default:
                    return {
                        skillCardData: allSkillData.skillData.filter(skill =>
                            skillCardData.some(sk => sk.id === skill.id)
                        ),
                        skillListData: allSkillData.presentationListRowPayload.rows.filter(skill =>
                            skillListData.some(sk => sk.key === skill.key)
                        )
                    };
            }
            return {
                skillCardData,
                skillListData
            };
        }
        static setInitialPaginationSkill(skillCardData,skillListData, pageNumber=0, cardPageSize, listPageSize) {
            var skillCardPaginatedData = this.paginateSkill(skillCardData, 0,cardPageSize);
            var skillListPaginatedData = this.paginateSkill(skillListData, 0,listPageSize);
            return {
                skillCardPaginatedData: skillCardPaginatedData,
                skillListPaginatedData: skillListPaginatedData
            };
        }
        static paginateSkill(skillArray, pageNumber, pageSize) {
            const startIndex = (pageNumber) * pageSize;
            const endIndex = startIndex + pageSize;
            return skillArray.slice(startIndex, endIndex);
        }
        
    }
    
    return ({ SkillOperationUtil});
}
