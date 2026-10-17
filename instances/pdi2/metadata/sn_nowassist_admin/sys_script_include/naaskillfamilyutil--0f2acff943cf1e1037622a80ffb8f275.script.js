var NAASkillFamilyUtil = {

    _constructSkillFamily: function(skillFamilyGr) {
        var skillFamily = {};
        skillFamily['id'] = skillFamilyGr.getValue('sys_id');
        skillFamily['label'] = skillFamilyGr.getDisplayValue('name') || '';
        skillFamily['name'] = skillFamilyGr.getValue('name');
        skillFamily['sub_title'] = skillFamilyGr.getDisplayValue('sub_title') || '';
        skillFamily['description'] = skillFamilyGr.getDisplayValue('description') || '';
        skillFamily['image_url'] = skillFamilyGr.getValue('image_url');
        skillFamily['preview_image'] = skillFamilyGr.getValue('preview_image');
        skillFamily['parent'] = skillFamilyGr.getValue('parent');
        skillFamily['type'] = skillFamilyGr.getValue('type');
        skillFamily['category'] = skillFamilyGr.getValue('category');
        return skillFamily;
    },

    _getSkillFamily: function(parent, type) {
        try {
            parent = parent || "";
            var skillFamilyGr = new GlideRecord(NAAConstant.SKILL_FAMILY);

            if (gs.nil(parent)) {
                skillFamilyGr.addNullQuery("parent");
            } else {
                skillFamilyGr.addQuery("parent", parent);
            }
            skillFamilyGr.addQuery("type", type);
            skillFamilyGr.orderBy('order');
            skillFamilyGr.query();

            var skillFamily = [];

            while (skillFamilyGr.next()) {
                skillFamily.push(NAASkillFamilyUtil._constructSkillFamily(skillFamilyGr));
            }

            return skillFamily;
        } catch (error) {
            gs.error("Error in NAASkillFamilyUtil._getSkillFamily ::>> ", error.toString());
            return [];
        }
    },

    _getSkillFamilyById: function(id) {
        try {
            var skillFamilyGr = new GlideRecord(NAAConstant.SKILL_FAMILY);
            return skillFamilyGr.get(id) ? NAASkillFamilyUtil._constructSkillFamily(skillFamilyGr) : {};
        } catch (error) {
            gs.error("Error in _getSkillFamilyById:", error.toString());
            return {};
        }
    },

    getSkillFamilyName: function(id) {
        var skillFamilyData = NAASkillFamilyUtil._getSkillFamilyById(id);
        return skillFamilyData.name;
    },

    type: 'NAASkillFamilyUtil'
};
