var MobileUiRuleRepository = Class.create();
MobileUiRuleRepository.prototype = {
  initialize: function () { },

  type: "MobileUiRuleRepository",

  setIfPresent: function (field, value, gr) {
    if (value) {
      gr.setValue(field, value);
    }
  },

  saveMobileUiRuleActions: function (mobileUiRuleId, mobileUiRuleActions) {
    var gr = new GlideRecord("sys_sg_ui_rule_action");
    mobileUiRuleActions.forEach(
      function (mobileUiRuleAction, index) {
        if (mobileUiRuleAction.id) {
          if (gr.get(mobileUiRuleAction.id)) {
            this.setIfPresent("sys_scope", mobileUiRuleAction.scope, gr);
            this.setIfPresent("operation", mobileUiRuleAction.operation, gr);
            this.setIfPresent("order", mobileUiRuleAction.order, gr);
            this.setIfPresent("target", mobileUiRuleAction.target, gr);
            this.setIfPresent("value", mobileUiRuleAction.value, gr);
            this.setIfPresent("ui_rule", mobileUiRuleId, gr);
            gr.update();
          }
        } else {
          gr.newRecord();
          this.setIfPresent("sys_scope", mobileUiRuleAction.scope, gr);
          this.setIfPresent("operation", mobileUiRuleAction.operation, gr);
          this.setIfPresent("order", mobileUiRuleAction.order, gr);
          this.setIfPresent("target", mobileUiRuleAction.target, gr);
          this.setIfPresent("value", mobileUiRuleAction.value, gr);
          this.setIfPresent("ui_rule", mobileUiRuleId, gr);
          gr.insert();
        }
      }.bind(this)
    );
  },

  saveMobileUiRuleAction: function (mobileUiRuleAction) {
    var gr = new GlideRecord("sys_sg_ui_rule_action");
    if (mobileUiRuleAction.id) {
      if (gr.get(mobileUiRuleAction.id)) {
        this.setIfPresent("sys_scope", mobileUiRuleAction.scope, gr);
        this.setIfPresent("operation", mobileUiRuleAction.operation, gr);
        this.setIfPresent("order", mobileUiRuleAction.order, gr);
        this.setIfPresent("target", mobileUiRuleAction.target, gr);
        this.setIfPresent("value", mobileUiRuleAction.value, gr);
        this.setIfPresent("ui_rule", mobileUiRuleAction.mobileUiRuleId, gr);
        gr.update();
      }
    } else {
      gr.newRecord();
      this.setIfPresent("sys_scope", mobileUiRuleAction.scope, gr);
      this.setIfPresent("operation", mobileUiRuleAction.operation, gr);
      this.setIfPresent("order", mobileUiRuleAction.order, gr);
      this.setIfPresent("target", mobileUiRuleAction.target, gr);
      this.setIfPresent("value", mobileUiRuleAction.value, gr);
      this.setIfPresent("ui_rule", mobileUiRuleAction.mobileUiRuleId, gr);
      gr.insert();
    }

    return gr;
  },

  saveMobileUiRule: function (mobileUiRule) {
    var mobileUiRuleGR = new GlideRecord("sys_sg_ui_rule");

    if (mobileUiRule.id) {
      if (mobileUiRuleGR.get(mobileUiRule.id)) {
        this.setIfPresent("sys_scope", mobileUiRule.scope, mobileUiRuleGR);
        this.setIfPresent("active", mobileUiRule.active, mobileUiRuleGR);
        mobileUiRuleGR.setValue("condition", mobileUiRule.condition);
        this.setIfPresent("name", mobileUiRule.name, mobileUiRuleGR);
        this.setIfPresent("order", mobileUiRule.order, mobileUiRuleGR);
        this.setIfPresent("parent_id", mobileUiRule.parentId, mobileUiRuleGR);
        this.setIfPresent(
          "parent_table",
          mobileUiRule.parentTable,
          mobileUiRuleGR
        );
        this.setIfPresent(
          "reverse_if_false",
          mobileUiRule.reverseIfFalse,
          mobileUiRuleGR
        );
        this.setIfPresent("trigger", mobileUiRule.trigger, mobileUiRuleGR);
        mobileUiRuleGR.update();
      }
    } else {
      this.setIfPresent("sys_scope", mobileUiRule.scope, mobileUiRuleGR);
      this.setIfPresent("active", mobileUiRule.active, mobileUiRuleGR);
      mobileUiRuleGR.setValue("condition", mobileUiRule.condition);
      this.setIfPresent("name", mobileUiRule.name, mobileUiRuleGR);
      this.setIfPresent("order", mobileUiRule.order, mobileUiRuleGR);
      this.setIfPresent("parent_id", mobileUiRule.parentId, mobileUiRuleGR);
      this.setIfPresent(
        "parent_table",
        mobileUiRule.parentTable,
        mobileUiRuleGR
      );
      this.setIfPresent(
        "reverse_if_false",
        mobileUiRule.reverseIfFalse,
        mobileUiRuleGR
      );
      this.setIfPresent("trigger", mobileUiRule.trigger, mobileUiRuleGR);
      mobileUiRuleGR.insert();
    }

    if (
      mobileUiRule.mobileUiRuleActions != undefined &&
      mobileUiRule.mobileUiRuleActions.length > 0
    ) {
      this.saveMobileUiRuleActions(
        mobileUiRuleGR.getValue("sys_id"),
        mobileUiRule.mobileUiRuleActions
      );
    }

    return mobileUiRuleGR;
  },

  updateMobileUiRule: function (mobileUiRule) {
    var mobileUiRuleGR = new GlideRecord("sys_sg_ui_rule");

    if (mobileUiRuleGR.get(mobileUiRule.id)) {
      this.setIfPresent("sys_scope", mobileUiRule.scope, mobileUiRuleGR);
      this.setIfPresent("active", mobileUiRule.active, mobileUiRuleGR);
      mobileUiRuleGR.setValue("condition", mobileUiRule.condition);
      this.setIfPresent("name", mobileUiRule.name, mobileUiRuleGR);
      this.setIfPresent("order", mobileUiRule.order, mobileUiRuleGR);
      this.setIfPresent("parent_id", mobileUiRule.parentId, mobileUiRuleGR);
      this.setIfPresent(
        "parent_table",
        mobileUiRule.parentTable,
        mobileUiRuleGR
      );
      this.setIfPresent(
        "reverse_if_false",
        mobileUiRule.reverseIfFalse,
        mobileUiRuleGR
      );
      this.setIfPresent("trigger", mobileUiRule.trigger, mobileUiRuleGR);
      mobileUiRuleGR.update();

      if (
        mobileUiRule.mobileUiRuleActions != undefined &&
        mobileUiRule.mobileUiRuleActions.length > 0
      ) {
        this.saveMobileUiRuleActions(
          mobileUiRuleGR.getValue("sys_id"),
          mobileUiRule.mobileUiRuleActions
        );
      }
      return mobileUiRuleGR;
    }

    return mobileUiRuleGR;
  },

  updateMobileUiRuleAction: function (mobileUiRuleAction) {
    var mobileUiRuleActionGR = new GlideRecord("sys_sg_ui_rule_action");

    if (mobileUiRuleActionGR.get(mobileUiRuleAction.id)) {
      this.setIfPresent(
        "sys_scope",
        mobileUiRuleAction.scope,
        mobileUiRuleActionGR
      );
      this.setIfPresent(
        "operation",
        mobileUiRuleAction.operation,
        mobileUiRuleActionGR
      );
      this.setIfPresent(
        "order",
        mobileUiRuleAction.order,
        mobileUiRuleActionGR
      );
      this.setIfPresent(
        "target",
        mobileUiRuleAction.target,
        mobileUiRuleActionGR
      );
      this.setIfPresent(
        "value",
        mobileUiRuleAction.value,
        mobileUiRuleActionGR
      );
      this.setIfPresent(
        "ui_rule",
        mobileUiRuleAction.mobileUiRuleId,
        mobileUiRuleActionGR
      );
      mobileUiRuleActionGR.update();

      return mobileUiRuleActionGR;
    }

    return mobileUiRuleActionGR;
  },

  deleteMobileUiRule: function (mobileUiRuleId) {
    var hasRecordBeenDeleted = false;
    var mobileUiRuleGR = new GlideRecord("sys_sg_ui_rule");

    if (mobileUiRuleGR.get(mobileUiRuleId)) {
      hasRecordBeenDeleted = mobileUiRuleGR.deleteRecord();
    }

    return hasRecordBeenDeleted;
  },

  deleteMobileUiRuleAction: function (mobileUiRuleActionId) {
    var hasRecordBeenDeleted = false;
    var mobileUiRuleActionGR = new GlideRecord("sys_sg_ui_rule_action");

    if (mobileUiRuleActionGR.get(mobileUiRuleActionId)) {
      hasRecordBeenDeleted = mobileUiRuleActionGR.deleteRecord();
    }

    return hasRecordBeenDeleted;
  },

  updateMobileUiRuleOrders: function (mobileUiRuleOrders) {
    var mobileUiRuleGR = new GlideRecord("sys_sg_ui_rule");
    mobileUiRuleOrders.forEach(
      function (mobileUiRuleOrder, index) {
        if (mobileUiRuleOrder.id) {
          if (mobileUiRuleGR.get(mobileUiRuleOrder.id)) {
            this.setIfPresent("order", mobileUiRuleOrder.order, mobileUiRuleGR);
            mobileUiRuleGR.update();
          }
        }
      }.bind(this)
    );
    return true;
  },

  updateMobileUiRuleActionOrders: function (mobileUiRuleActionOrders) {
    var mobileUiRuleActionGR = new GlideRecord("sys_sg_ui_rule_action");
    mobileUiRuleActionOrders.forEach(
      function (mobileUiRuleActionOrder, index) {
        if (mobileUiRuleActionOrder.id) {
          if (mobileUiRuleActionGR.get(mobileUiRuleActionOrder.id)) {
            this.setIfPresent(
              "order",
              mobileUiRuleActionOrder.order,
              mobileUiRuleActionGR
            );
            mobileUiRuleActionGR.update();
          }
        }
      }.bind(this)
    );
    return true;
  },
};
