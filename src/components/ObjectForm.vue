<template>
  <div>
    <div v-if="validationError" class="ui red negative segment transition visible">
      <div class="ui red header">
        <i class="disabled warning sign icon" />
        <div class="content">
          {{ validationErrorTitle }}
          <div class="sub header">
            {{ validationErrorDescription }}
          </div>
        </div>
      </div>
    </div>
    <SuiForm v-if="state.needsRecordType && !validationError">
      <SuiFormField :required="true" :error="state.showErrors && !state.recordType">
        <label>Please select a Record Type</label>
        <Dropdown
          v-model="state.recordTypeSaved"
          :defaultText="$gettext('Select Record Type')"
          :items="state.recordTypes"
          itemText="name"
          itemValue="recordTypeId"
        />
      </SuiFormField>
    </SuiForm>
    <SuiForm v-if="!state.needsRecordType && !validationError && !state.layout">
      <ObjectFormField
        v-for="(field, key) in state.fields"
        :key="key"
        v-model="state.obj[field.name]"
        :valueLabel="toLabel(state.obj, field.name)"
        :field="field"
        :showError="state.showErrors"
        :forceCurrencyCode="forceCurrencyCode"
        :hideHelpText="hideHelpText"
        @input="emitUpdate"
        @fieldChange="(v) => $emit('fieldChange', v)"
      />
      <SuiButton v-if="hasSave" type="submit">{{ $gettext('Save') }}</SuiButton>
    </SuiForm>
    <SuiForm v-if="!state.needsRecordType && !validationError && state.layout && state.ready" class="object-form">
      <Fragment v-for="(section, sectionKey) in state.layout.visibleEditLayoutSections" :key="sectionKey">
        <h3 class="ui header">{{ section.heading }}</h3>
        <div class="ui grid fields">
          <Fragment v-for="(row, rowKey) in section.layoutRows" :key="rowKey">
            <!-- Layout rows are ignored and fields are plotted one after another -->
            <Fragment v-for="(item, itemKey) in row.layoutItems" :key="itemKey">
              <template v-for="(comp, compKey) in item.layoutComponents">
                <ObjectFormField
                  v-if="!comp.exclude"
                  :key="compKey"
                  v-model="state.obj[comp.value]"
                  :valueLabel="toLabel(state.obj, comp.value, comp.field)"
                  :forceCurrencyCode="forceCurrencyCode"
                  :field="comp.field"
                  :showError="state.showErrors"
                  :hideHelpText="hideHelpText"
                  :label="item.label"
                  :data-debug-name="comp.details.name"
                  :class="fieldsClass"
                  :obj="state.obj"
                  @input="emitUpdate"
                  @fieldChange="(v) => $emit('fieldChange', v)"
                />
              </template>
            </Fragment>
          </Fragment>
        </div>
      </Fragment>
      <SuiButton v-if="hasSave" type="submit">{{ $gettext('Save') }}</SuiButton>
    </SuiForm>
  </div>
</template>

<script>
/* eslint-disable no-unused-vars, max-len, vue/no-unused-properties, consistent-return, vue/return-in-computed-property, vue/no-side-effects-in-computed-properties */

import Dropdown from './Dropdown'
import ObjectFormField from './ObjectFormField'
import Vue from 'vue'
import { Field, contextQuery, loadLayout, loadSchema, saveObject, useConfigStore } from '../index'
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from '@vue/composition-api'

export default {
  name: 'ObjectForm',
  components: { Dropdown, ObjectFormField },
  props: {
    objectType: {
      require: true,
      type: String,
    },
    fields: {
      default: () => [],
      type: Array,
    },
    excludeFields: {
      default: () => [],
      type: Array,
    },
    forceCurrencyCode: {
      default: '',
      type: String,
    },
    readOnlyFields: {
      default: () => [],
      type: Array,
    },
    clearableFields: {
      default: () => [],
      type: Array,
    },
    customReferences: {
      type: Object,
    },
    customSettings: {
      type: Object,
      default: () => {},
    },
    hideHelpText: {
      type: Boolean,
      default: false,
    },
    hasSave: {
      type: Boolean,
    },
    id: {
      type: String,
    },
    recordType: {
      type: String,
    },
    value: {
      type: Object,
    },
    ignoreExternalIdValidation: {
      type: Boolean,
      default: false,
    },
    allFieldsReadOnly: {
      type: Boolean,
      default: false,
    },
    allFieldsClearable: {
      type: Boolean,
      default: false,
    },
    fieldsClass: {
      type: String,
      default: 'eight wide column',
    },
  },
  emits: ['fieldChange', 'input'],

  setup(props, attrs) {
    const excludes = [
      'attributes',
      'Id',
      'CreatedById',
      'CreatedDate',
      'Division',
      'IsDeleted',
      'LastActivityDate',
      'LastModifiedById',
      'LastModifiedDate',
      'SystemModstamp',
    ]
    const state = reactive({
      ready: false,
      fields: [],
      fieldsDict: {},
      id: props.id,
      obj: {},
      recordTypes: computed(() => {
        if (state.schema) {
          return state.schema.recordTypeInfos
        }

        return []
      }),
      recordType: props.recordType,
      recordTypeId: computed(() => {
        if (state.loadedObj) {
          return state.loadedObj.recordTypeId
        }
        if (state.recordType) {
          for (const t of state.recordTypes) {
            if (t.name === state.recordType) {
              return t.recordTypeId
            }
          }
        } else if (state.recordTypes.length === 1) {
          return state.recordTypes[0].recordTypeId
        }
      }),
      recordTypeSaved: '',
      externalId: '',
      externalIdFields: [],
      layout: null,
      schema: null,
      needsRecordType: computed(() => {
        return !state.recordTypeId
      }),
      fieldValidationErrors: [],
      isValid: computed(() => {
        let valid = true

        state.fieldValidationErrors = []

        for (const field of state.fields) {
          if (!field.valid(state.obj[field.name]) && field.updateable) {
            state.fieldValidationErrors.push(`${field.label} is mandatory.`)
            valid = false
          }
        }

        return valid
      }),
      showErrors: true,
      result: computed(() => {
        const result = {
          ignoreFields: [],
        }
        let valid = true

        for (const field of state.fields) {
          result[field.name] = state.obj[field.name]
          if (field.relationshipName && state.obj[field.name]) {
            let found = false

            for (const ref of field.references) {
              if (ref.value === state.obj[field.name]) {
                result[field.relationshipName] = {
                  Id: ref.value,
                  Name: ref.text,
                }
                result.ignoreFields.push(field.relationshipName)
                found = true
                break
              }
            }
            if (!found) console.log(`ref not found:${field.name}`, state.obj[field.name])
          }
          if (!field.nillable && (typeof result[field.name] === 'undefined' || String(result[field.name]) === 'null')) {
            valid = false
          }
        }

        return result
      }),
    })

    const name = ref()

    const initSchema = async () => {
      if (!props.objectType) {
        return
      }
      const schema = await loadSchema(props.objectType)

      state.schema = schema
    }

    onMounted(async () => {
      initSchema()
    })

    onBeforeUnmount(async () => {
      for (const field of state.fields) {
        if (field.dependentValueWatcher) {
          field.dependentValueWatcher()
        }
      }
    })

    watch(() => [props.objectType], initSchema)

    watch(
      () => [props.objectType, state.recordTypeId, state.schema],
      async () => {
        if (!props.objectType) {
          return
        }
        if (!state.schema) {
          return
        }
        if (!state.recordTypeId) {
          return
        }
        const fields = []
        let req_fields = []

        const includeFields = props.fields
        const excludeFields = [...props.excludeFields]

        if (includeFields.length) {
          // handle if field list is provided
          for (const field_name of includeFields) {
            if (field_name.trim()) {
              for (const field of state.schema.fields) {
                if (field.name === field_name.trim()) {
                  const f = new Field(field, props.objectType, false)

                  if (props.customSettings && props.customSettings.includes[f.name]) {
                    f.settings = props.customSettings[f.name]
                  }
                  if (fieldShouldBeClearable(f)) {
                    f.settings.clearable = true
                  }
                  if (fieldShouldBeReadOnly(f)) {
                    f.updateable = false
                  } else if (props.customReferences && props.customReferences[f.name]) {
                    f.loadExternalReferences(props.customReferences[f.name])
                  } else {
                    f.load_refs()
                  }
                  if (f.calculated || !f.updateable) {
                    continue
                  }
                  req_fields.push(f)
                }
              }
            }
          }
          state.fields = req_fields
          state.ready = true
        } else {
          if (!state.recordTypeId) {
            return
          }
          // handle if no field list is provided but we have a layout
          let layout

          try {
            layout = await loadLayout(props.objectType, state.recordTypeId)
          } catch (e) {
            console.warn(
              'layout support for this env not found. Cache table needs not only schema but layout describes as well'
            )
          }
          if (layout) {
            const readOnly = props.allFieldsReadOnly
            const sections = readOnly ? layout.detailLayoutSections : layout.editLayoutSections

            layout.visibleEditLayoutSections = computed(() => {
              const result = []
              let count = 0

              for (const section of sections) {
                if (section.fieldCount > 0 && ((count > 1 && readOnly) || !readOnly)) {
                  result.push(section)
                }
                count++
              }

              return result
            })
            const data = []
            const filed = []
            const fieldDict = {}

            for (const section of sections) {
              let fieldCount = 0

              for (const row of section.layoutRows) {
                for (const row of section.layoutRows) {
                  for (const item of row.layoutItems) {
                    if (item.layoutComponents) {
                      for (const comp of item.layoutComponents) {
                        if (!comp.details) {
                          comp.exclude = true
                          continue
                        }
                        if (excludeFields.indexOf(comp.value) === -1) {
                          let field

                          if (fieldDict[comp.details.name]) {
                            field = fieldDict[comp.details.name]
                          } else {
                            field = new Field(comp.details, null, false)
                            if (item.required === true) field.required = item.required
                            fieldDict[comp.details.name] = field
                            fields.push(field)
                            if (props.customSettings && props.customSettings[field.name]) {
                              field.settings = props.customSettings[field.name]
                            }
                            if (
                              fieldShouldBeReadOnly(field) ||
                              item.editableForNew === false ||
                              item.editableForUpdate === false
                            ) {
                              field.updateable = false
                            }
                            if (fieldShouldBeClearable(field)) {
                              field.settings.clearable = true
                            }
                            if (props.customReferences && props.customReferences[field.name]) {
                              field.loadExternalReferences(props.customReferences[field.name])
                            } else if (field.referenceTo && field.referenceTo.length) {
                              field.load_refs()
                            }
                          }
                          comp.field = field
                          comp.exclude = false
                          fieldCount++
                        } else {
                          comp.exclude = true
                        }
                      }
                    }
                  }
                }
              }
              section.fieldCount = fieldCount
            }
            state.layout = layout
            state.fields = fields
            state.ready = true
          } else {
            // handle if no field list is provided and we dont have a layout
            for (const field of state.schema.fields) {
              if (field.calculated || !field.updateable) {
                continue
              }
              if (excludes.indexOf(field.name) === -1) {
                let f

                try {
                  f = new Field(field, this, false)
                } catch (e) {
                  console.warn(e)
                  excludeFields.push(field.name)
                  console.warn('removed field')
                  continue
                }
                if (fieldShouldBeReadOnly(f)) {
                  f.updateable = false
                }
                if (fieldShouldBeClearable(f)) {
                  f.settings.clearable = true
                }
                if (f.nillable && f.name !== 'Name') {
                  fields.push(f)
                } else {
                  req_fields.push(f)
                }
              }
            }
            for (const field of state.schema.fields) {
              if (field.externalId) {
                state.externalIdFields.push(field.name)
              }
            }
            req_fields = req_fields.concat(fields)
            req_fields = req_fields.filter((obj) => {
              for (const excludeField of excludeFields) {
                if (obj.name === excludeField.trim()) {
                  return false
                }
              }

              return true
            })
            state.fields = req_fields
            state.ready = true
          }
        }

        if (props.value) {
          state.obj = props.value
        }

        for (const field of state.fields) {
          state.fieldsDict[field.name] = field
          if (field.type === 'picklist' && field.controllerName) {
            field.dependentValueWatcher = watch(
              () => state.obj[field.controllerName],
              (newVal) => {
                if (state.fieldsDict[field.controllerName] && !fieldShouldBeReadOnly(field)) {
                  // When controller field changes - Reset dependent value
                  Vue.set(state.obj, field.name, null)
                  // Find the index of the selected value in the controller field
                  const index = state.fieldsDict[field.controllerName].picklistValues.findIndex(
                    (o) => o.value === newVal
                  )

                  field.filteredValues = field.picklistValues.filter((p) => {
                    // base64 decode
                    const bitmap = atob(p.validFor)

                    // Test each of the available options and use bitwise operators
                    // to check whether each dependent value is valid
                    return !!(bitmap.charCodeAt(index >> 3) & (128 >> index % 8))
                  })

                  if (field.filteredValues.length === 1) Vue.set(state.obj, field.name, field.filteredValues[0].value)
                }
              },
              {
                immediate: true,
              }
            )
          }
        }
      }
    )

    const validationError = computed(() => {
      const configStore = useConfigStore()
      const table = configStore.getCacheDict[props.objectType]

      if (!props.ignoreExternalIdValidation) {
        if (!table.externalField && !props.id) {
          validationErrorTitle.value = $gettext('You can not add an object of this type.')
          validationErrorDescription.value = $gettext(
            'This Object does not have an external ID field in the config.json.'
          )

          return true
        }
        if (props.id && props.id.startsWith('PIT_') && !table.externalField) {
          validationErrorTitle.value = $gettext('This Object is not editable. You need to sync first.')
          validationErrorDescription.value = $gettext(
            'This Object does not have an external ID field in the config.json. Please provide one or sync first before editing.'
          )

          return true
        }
      }

      return false
    })
    const validationErrorTitle = ref('')
    const validationErrorDescription = ref('')

    watch(
      () => [props.id, state.fields],
      async () => {
        state.showErrors = false
        if (state.fields.length === 0) {
          return
        }
        if (!props.id && !props.value) {
          for (const field of state.fields) {
            if (state.obj[field.name] !== '') {
              state.obj[field.name] = null
            }
          }
        }
        state.id = props.id
        if (!props.id) {
          return
        }
        if (validationError.value) {
          return
        }
        const q = `select * from {{${props.objectType}}} where Id='{{ id }}'`
        const data = await contextQuery(q, { id: props.id })

        name.value = data.Name
        state.loadedObj = data[0]
        state.obj = data[0]
      }
    )

    const validate = () => {
      let valid = true

      for (const field of state.fields) {
        field.show_errors = true
        if (!field.valid.value) {
          valid = false
        }
      }

      return valid
    }

    const save = (extra) => {
      if (state.needsRecordType && state.recordTypeSaved) {
        state.recordTypeId = state.recordTypeSaved
        state.showErrors = false

        return
      }
      if (!state.isValid) {
        state.showErrors = true

        return
      }
      const obj = {
        ...state.result,
        ...extra,
      }

      if (state.recordTypeId && state.recordTypes.length > 1) {
        for (const t of state.recordTypes) {
          if (t.recordTypeId === state.recordTypeId) {
            obj.RecordType = {
              Id: t.recordTypeId,
              Name: t.name,
            }
            obj.RecordTypeId = state.recordTypeId
            obj.ignoreFields.push('RecordType')
            break
          }
        }
      }
      obj.LastModifiedDate = new Date().toISOString()
      obj.ignoreFields.push('LastModifiedDate')
      obj.objectType = props.objectType
      if (props.id) {
        obj.Id = props.id
      }
      window.console.info('save form', obj)
      saveObject(obj)

      return true
    }

    const clear = () => {
      for (const field of state.fields) {
        state.obj[field.name] = null
      }
      state.showErrors = false
    }

    const emitUpdate = () => {
      // console.log('update', state.obj)
      attrs.emit('input', state.obj)
    }

    const toLabel = (obj, path, field = null) => {
      if (field && field.references.value.length) {
        for (const ref of field.references.value) {
          if (ref.value === obj[path] && ref.text) return ref.text
        }
      }

      let newPath = `${path.substr(0, path.length - 1)}r`

      if (obj[newPath]) {
        return obj[newPath].Name
      }
      if (path.substr(path.length - 2) === 'Id') {
        newPath = path.substr(0, path.length - 2)
        if (obj[newPath]) {
          return obj[newPath].Name
        }
      }

      return ''
    }

    const fieldShouldBeReadOnly = (field) => {
      return props.readOnlyFields.includes(field.name) || props.allFieldsReadOnly
    }

    const fieldShouldBeClearable = (field) => {
      return (
        (props.clearableFields.includes(field.name) || props.allFieldsClearable) && field.settings.clearable !== false
      )
    }

    return {
      toLabel,
      state,
      save,
      validate,
      clear,
      validationError,
      validationErrorTitle,
      validationErrorDescription,
      name,
      emitUpdate,
    }
  },
}
</script>

<style lang="scss" scoped>
.ui.form.object-form ::v-deep {
  .field > label {
    color: rgba(0, 0, 0, 0.7);
  }

  .ui.grid.fields {
    margin: -0.5em 0em 0em -0.5em;
    padding-bottom: 0;
  }

  .field {
    padding-top: 0;
  }

  .field .ui.checkbox.toggle {
    margin-top: 0.2em !important;
    margin-bottom: -0.5em;
  }

  h3.ui.header {
    margin-bottom: 0;
    margin-top: 0.5em;
    padding-bottom: 0.8em;
  }

  .ui.header:first-child {
    margin-top: 0.5em;
  }
}
</style>
