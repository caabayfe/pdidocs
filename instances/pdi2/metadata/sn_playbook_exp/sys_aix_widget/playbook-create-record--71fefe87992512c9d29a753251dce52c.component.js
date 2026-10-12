import{isServer as e,html as t}from"lit";import{msg as r}from"@lit/localize";import{state as a,customElement as s}from"lit/decorators.js";import{decorators as o,AIUXWidgetElement as i}from"@servicenow/aiux-components-core";import{createGraphQLClient as l,RecordAPIKey as d}from"@servicenow/aiux-components-record";import{withPlaybookFormContext as c}from"@servicenow/aiux-components-playbook";function n(e,t,r,a){var s,o=arguments.length,i=o<3?t:a;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)i=Reflect.decorate(e,t,r,a);else for(var l=e.length-1;l>=0;l--)(s=e[l])&&(i=(o<3?s(i):o>3?s(t,r,i):s(t,r))||i);return o>3&&i&&Object.defineProperty(t,r,i),i}let{category:_,discoverable:h}=o,u=`
  query($sysId: String!) {
    GlideRecord_Query {
      sys_flow_data(sys_id: $sysId) {
        _results {
          vars {
            variables {
              variableName
              variableValue
            }
          }
        }
      }
    }
  }
`,p=`
  mutation($sysId: String!, $recordCreated: String!, $table: String!) {
    GlideRecord_Mutation {
      update_sys_flow_data(sys_id: $sysId, state: "COMPLETE", vars: [
        {variableName: "record_created", variableValue: $recordCreated},
        {variableName: "table", variableValue: $table}
      ]) {
        state { value }
      }
    }
  }
`,y=l();class b extends c(i){static{this.ssr=!1}static{this.playbook_hooks={"PLAYBOOK#SUBMIT_FORM_UI_ACTION":{before:async function({action:e}){if(!e?.formFieldsRequired)return null;let t=this._formApi;if(!t)return{blocked:!0,errors:[r("Form not ready — please wait.")]};let a=await t.save?.();if(!1===a||a?.blocked)return{blocked:!0,errors:[]};let s=t.sysId;return s&&"-1"!==s?(this._onRecordCreated(s),{handled:!0,result:{ok:!0}}):{blocked:!0,errors:[]}}}}}static{this.properties={associated_record:{type:Object},associated_table:{type:Object},form_view:{type:Object}}}get _isDirty(){return this._formApi?.isDirty?.()??!1}connectedCallback(){super.connectedCallback(),this._pushState()}disconnectedCallback(){super.disconnectedCallback(),this._lastPushedState=void 0}updated(t){super.updated(t),e||(this._fetchTableIfNeeded(),this._pushState())}_fetchTableIfNeeded(){let e=this.associated_record?.value;e&&e!==this._lastFetchKey&&(this._lastFetchKey=e,this._loading=!0,this._error=!1,this._table="",this._createdSysId="",this._completionFired=!1,y.query(u,{sysId:e}).then(({data:e,errors:t})=>{if(t?.length)throw Error(t[0].message);let r=(e?.GlideRecord_Query?.sys_flow_data?._results?.[0]?.vars?.variables??[]).find(e=>"table"===e.variableName);if(!r?.variableValue)throw Error("No table variable found in sys_flow_data.");this._table=r.variableValue,this._loading=!1}).catch(()=>{this._error=!0,this._loading=!1}))}_onRecordCreated(e){if(this._completionFired)return;this._completionFired=!0,this._createdSysId=e;let t=this.associated_record?.value;t&&y.mutate(p,{sysId:t,recordCreated:e,table:this._table}).catch(()=>{console.error("[playbook-create-record] Failed to complete activity.")})}_pushState(){let e=this._isDirty;e!==this._lastPushedState?.isDirty&&(this._lastPushedState={isDirty:e},this.dispatchEvent(new CustomEvent("playbook-activity-renderer:update",{bubbles:!0,composed:!0,detail:{isDirty:e}})))}render(){if(!this.associated_record?.value||this.associated_table?.value!=="sys_flow_data")return t`<p class="text-sm text-base-content/40 italic" role="status">
        ${r("Configuration Error. Please contact your system administrator.")}
      </p>`;if(this._loading)return t`<p class="text-sm text-base-content/40 italic" role="status">
        ${r("Loading…")}
      </p>`;if(this._error||!this._table)return t`<p class="text-sm text-error" role="alert">
        ${r("There was an error. We ran into an issue, please refresh to attempt to resolve.")}
      </p>`;let e=this._activityContext,a=this._createdSysId||"-1",s=this._createdSysId||e?.formReadOnly?"display-only":"default";return t`
      <aiux-record-provider
        table=${this._table}
        .sysId=${a}
        view=${this.form_view?.value||""}
        context-id=${e?.activityContextId||""}
        .requiredAPIs=${[d.Actions]}
      >
        <aiux-record-form edit-mode=${s}></aiux-record-form>
      </aiux-record-provider>
    `}constructor(...e){super(...e),this._table="",this._loading=!0,this._error=!1,this._createdSysId="",this._lastFetchKey="",this._completionFired=!1}}n([a()],b.prototype,"_table",void 0),n([a()],b.prototype,"_loading",void 0),n([a()],b.prototype,"_error",void 0),n([a()],b.prototype,"_createdSysId",void 0),b=n([h(!0),_("platform"),s("playbook-create-record")],b);export{b as default};
//# sourceMappingURL=playbook-create-record-DBptugXd.js.map
