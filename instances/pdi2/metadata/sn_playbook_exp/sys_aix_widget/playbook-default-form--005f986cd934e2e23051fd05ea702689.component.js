import{isServer as t,html as e,nothing as i}from"lit";import{msg as s}from"@lit/localize";import{customElement as o}from"lit/decorators.js";import{unsafeHTML as r}from"lit/directives/unsafe-html.js";import{decorators as a,AIUXWidgetElement as c}from"@servicenow/aiux-components-core";import{RecordAPIKey as l}from"@servicenow/aiux-components-record";import{withPlaybookFormContext as n}from"@servicenow/aiux-components-playbook";let{category:d,discoverable:u}=a;class p extends n(c){static{this.ssr=!1}static{this.aiContext={description:"The current playbook step: a form the user fills out, or read-only instruction text when the step has no fields.",bestFor:"When the user asks about the current task, the form fields, wants to fill in values, or needs help completing the playbook step."}}static{this.properties={description:{type:Object},table:{type:Object},associated_table:{type:Object},record:{type:Object},associated_record:{type:Object},form_view:{type:Object},form_fields:{type:Object}}}get _isDirty(){return this._formApi?.isDirty?.()??!1}get _isInstruction(){return!this.form_fields?.value&&!this.form_view?.value}connectedCallback(){super.connectedCallback(),this._pushState(),t||this._pushWidgetContext()}disconnectedCallback(){super.disconnectedCallback(),this._lastPushedState=void 0}updated(e){super.updated(e),t||(this._pushState(),this._pushWidgetContext())}_pushWidgetContext(){let t=this.table?.value??this.associated_table?.value,e=this.record?.value??this.associated_record?.value;this.setAiContext({table:t,recordId:e,activityContextId:this._activityContext?.activityContextId,isDirty:this._isDirty})}_pushState(){let t=this._recordContext,e=this._isDirty;(t!==this._lastPushedState?.recordContext||e!==this._lastPushedState?.isDirty)&&(this._lastPushedState={recordContext:t,isDirty:e},this.dispatchEvent(new CustomEvent("playbook-activity-renderer:update",{bubbles:!0,composed:!0,detail:{recordContext:t,isDirty:e}})))}render(){let t=this._activityContext,o=this.description?.value,a=o?e`<div class="text-sm text-base-content/70">
          ${r(o)}
        </div>`:i;if(this._isInstruction)return o?a:e`<p class="text-sm text-base-content/40 italic" role="status">
            ${s("No instruction content available.")}
          </p>`;let c=this.table?.value??this.associated_table?.value,n=this.record?.value??this.associated_record?.value,d=this.form_view?.value,u=t?.activityContextId;if(!c||!n)return e`
        ${a}
        <p class="text-sm text-base-content/40 italic" role="status">
          ${s("No record data available.")}
        </p>
      `;let p=t?.formReadOnly?"display-only":"default";return e`
      ${a}
      <aiux-record-provider
        table=${c}
        .sysId=${n}
        view=${d||""}
        context-id=${u||""}
        .requiredAPIs=${[l.Actions]}
      >
        <aiux-record-form edit-mode=${p} hide-section-headers></aiux-record-form>
      </aiux-record-provider>
    `}}p=function(t,e,i,s){var o,r=arguments.length,a=r<3?e:null===s?s=Object.getOwnPropertyDescriptor(e,i):s;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(t,e,i,s);else for(var c=t.length-1;c>=0;c--)(o=t[c])&&(a=(r<3?o(a):r>3?o(e,i,a):o(e,i))||a);return r>3&&a&&Object.defineProperty(e,i,a),a}([u(!0),d("platform"),o("playbook-default-form")],p);export{p as default};
//# sourceMappingURL=playbook-default-form-CqocOXPp.js.map
