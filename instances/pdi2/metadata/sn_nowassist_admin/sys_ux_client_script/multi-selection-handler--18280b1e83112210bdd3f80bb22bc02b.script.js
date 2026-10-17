/**
* @param {object} params
* @param {object} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({ api, event, helpers }) {
  const repeaterItems = api.state.customSelectedItems;
  const currentItem = repeaterItems[event.context.item.index];
  var removedItem = [];
  if (currentItem.selectionType !== 'oobSkill') return;

  const skillCapabilityMapping = api?.state?.skillCapabilityMapping || {};

  const selectedValues = event.payload.value || [];
  const wasSelectedValues = currentItem?.selectedValues || [];
//component is not giving current removed item so added login to get removed item and remove depended skills
  const isRemoveAction = wasSelectedValues.length > selectedValues.length;
  currentItem.skillList = [];

  if (selectedValues.length > 0) {
    if (isRemoveAction) {
       removedItem = wasSelectedValues.filter(
        oldItem => !selectedValues.some(newItem => newItem.id === oldItem.id)
      );

      if (removedItem.length > 0) {
        const removedCapabilityId = removedItem[0].capabilityId;
        currentItem.skillList = wasSelectedValues.filter(
          item => item.capabilityId !== removedCapabilityId
        );
      }
    } else {
      const allNewSkills = selectedValues.flatMap(item => {
        const skills = skillCapabilityMapping[item.capabilityId] || [];
        return skills;
      });

      currentItem.skillList = [
        ...new Map(
          [...currentItem.skillList, ...allNewSkills].map(skill => [skill.id, skill])
        ).values()
      ];

    }

    //currentItem.capabilityList = selectedValues.map(item => item.capabilityId);

    currentItem.selectedValues = currentItem.skillList;
    // Update label and capability from last selected item
    const lastSelected = isRemoveAction ? removedItem[0] : selectedValues[selectedValues.length - 1];
    currentItem.label = lastSelected.label;
    currentItem.capabilityId = lastSelected.capabilityId;
        currentItem.capabilityList.push(...fetchM2MCapabilityForSkillId(lastSelected.id, skillCapabilityMapping))
        const dependentSkills = (skillCapabilityMapping[lastSelected.capabilityId] || [])
            .filter(skill => skill.id !== lastSelected.id);
        var data = { ...api.state?.skillCapabilityMapping }
        var updatedSkillList = [...dependentSkills] || [];
        var skillList = [];
        updatedSkillList.push(lastSelected)
        updatedSkillList.forEach(skill => {
            for (const key in data) {
                const items = data[key];
                items.forEach(item => {
                    if (item.id == skill.id) {
                        addAllCapabilitySkills(items, skillList, data, lastSelected)

                    }
                });
            }
        });

         if (skillList.length > 0) {
            if (!isRemoveAction) {
                currentItem.skillList = [
                    ...new Map(
                        [...currentItem.skillList, ...skillList].map(item => [item.id, item])
                    ).values()
                ];
            } else {
                currentItem.skillList = currentItem.skillList.filter(item =>
                    !skillList.some(skill => skill.id === item.id)
                );
            }
            helpers.modal.open("dependent_skill_modal");
            api.setState("interdependent_skills", {
                dependentSkills: skillList,
                currentSkill: lastSelected
            });
        }
        currentItem.selectedValues = currentItem.skillList;

    } else {
        // If selection was cleared
        currentItem.capabilityList = [];
        currentItem.selectedValues = [];
    }
    api.setState('disableSaveAndActive', isValidUserActions(repeaterItems))
    api.setState('updatedSkillCapabilityMapping', updatedSkillMappings);
    api.setState('customSelectedItems', JSON.parse(JSON.stringify(repeaterItems)));



    function isValidUserActions(repeaterItems) {
        for (const item of repeaterItems) {
            if (item.selectionType == 'oobSkillGroup' && (!item?.sys_id || !item?.selectedProvider)) {
                return true;
            } else if (item.selectionType == 'oobSkill' && !item?.selectedProvider || item?.skillList?.length == 0) {
                return true;
            }
        }
        return false;

    }

    function fetchM2MCapabilityForSkillId(skillId, skillCapabilityMapping) {
        var m2mSkillCapability = [];
        m2mSkillCapability = Object.keys(skillCapabilityMapping).filter(key =>
            skillCapabilityMapping[key].some(item => item.id === skillId)
        );
        return m2mSkillCapability;

    }

    function addAllCapabilitySkills(allMatchingSkills, updatedSkillList, data, lastselctedItem) {
        allMatchingSkills.forEach(skill => {
            // Avoid duplicates
            if (!updatedSkillList.some(s => s.id === skill.id)) {
                skill['selectionType'] = 'oobSkill';
                if (lastselctedItem.id != skill.id) {
                    updatedSkillList.push(skill);
                }

                // Recursively find and add nested matching skills by ID
                for (const key in data) {
                    const nestedSkills = data[key];
                    nestedSkills.forEach(item => {
                        if (item.id === skill.id) {
                            delete data[key];
                            addAllCapabilitySkills(nestedSkills, updatedSkillList, data, lastselctedItem);
                        }
                    });
                }
            }
        });

        return updatedSkillList;
    }

}
