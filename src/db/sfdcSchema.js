/* eslint-disable consistent-return */
import { Field } from './sfdcField'
import { createStore } from '../store'
import { getSchema } from '../app'

class SchemaStore {
  id = 'schema'
  state = {}
}

export const useSchemaStore = () => {
  return createStore(new SchemaStore())
}

export async function loadSchema(objectName) {
  const store = useSchemaStore()

  if (store.state[objectName]) {
    return store.state[objectName]
  } else {
    const result = await getSchema(objectName)

    store.state[objectName] = result

    return store.state[objectName]
  }
}

export async function getRecordTypeId(objectName, recordTypeName) {
  const schema = await loadSchema(objectName)

  for (const typ of schema.recordTypeInfos) {
    if (typ.name === recordTypeName) {
      return typ.recordTypeId
    }
  }
}

export async function getField(objectName, field_name) {
  const schema = await loadSchema(objectName)

  for (const field of schema.fields) {
    if (field.name === field_name.trim()) {
      const f = new Field(field, objectName)

      return f
    }
  }
  throw new Error(`field not found:${field_name}`)
}

export async function labelToValue(objectName, fieldName, label) {
  const schema = await loadSchema(objectName)

  for (const field of schema.fields) {
    if (field.name === fieldName.trim() && field.picklistValues) {
      for (const pick of field.picklistValues) {
        if (pick.label === label) {
          return pick.value
        }
      }
    }
  }
}

export async function getObjectNameField(objectName) {
  const schema = await loadSchema(objectName)

  for (const field of schema.fields) {
    if (field.nameField) {
      return field.name
    }
  }
  throw new Error('No name field found')
}
