

/**
 * create a JSON schema representing the webform
 */
export function buildJsonSchemaFromForm(formName) {
    const form = document.forms[formName]

    console.log(formName);

    const schema = {
        $schema: "http://json-schema.org/draft-07/schema#",
        type: "object",
        title: "Web Form Schema",
        name: formName,
        properties: {},
        required: [],
    };

    const seenRadioGroups = new Set();

    form.querySelectorAll('input, select, textarea').forEach(el => {
        const name = el.name;
        if (!name) return;

        let fieldSchema = {};
        const isRequired = el.required;

        if (el.tagName.toLowerCase() === 'input') {
            if (el.type === 'radio') {
                if (seenRadioGroups.has(name)) return;
                const options = [...form.querySelectorAll(`input[type="radio"][name="${name}"]`)]
                    .map(r => r.value)
                    .filter(v => v);
                fieldSchema = {
                    type: 'string',
                    enum: Array.from(new Set(options))
                };
                seenRadioGroups.add(name);
            } else if (el.type === 'checkbox') {
                // Checkboxes with same name? Treat as array
                const checkboxes = [...form.querySelectorAll(`input[type="checkbox"][name="${name}"]`)];
                if (checkboxes.length > 1) {
                    fieldSchema = {
                        type: 'array',
                        items: { type: 'string' },
                        uniqueItems: true
                    };
                } else {
                    fieldSchema = { type: 'boolean' };
                }
            } else {
                fieldSchema.type = getJsonSchemaTypeFromInput(el);
                if (el.minLength > 0) fieldSchema.minLength = el.minLength;
                if (el.maxLength > 0) fieldSchema.maxLength = el.maxLength;
                if (el.pattern) fieldSchema.pattern = el.pattern;
            }

            // Add closest label in the DOM to a 'label' property for fieldSchema
            const labelEl = form.querySelector(`label[for="${el.name}"]`) || el.closest('label');

            console.log('labelEl', labelEl);
            if (labelEl) {
                fieldSchema.label = labelEl.textContent.trim();
            }
        }

        else if (el.tagName.toLowerCase() === 'textarea') {
            fieldSchema.type = 'string';
        } else if (el.tagName.toLowerCase() === 'select') {
            const options = [...el.options].map(o => o.value).filter(v => v);
            if (el.multiple) {
                fieldSchema = {
                    type: 'array',
                    items: { type: 'string', enum: Array.from(new Set(options)) }
                };
            } else {
                fieldSchema = {
                    type: 'string',
                    enum: Array.from(new Set(options))
                };
            }
        }
        // map closest label text to an attribute in the schema
        // const label = form.querySelector(`label[for="${el.id}"]`) || el.closest('label');
        // if (label) {
        //     fieldSchema.title = label.textContent.trim();
        // }

        schema.properties[name] = fieldSchema;
        if (isRequired) schema.required.push(name);
    });

    if (schema.required.length === 0) delete schema.required;
    return schema;
}

function getJsonSchemaTypeFromInput(input) {
    switch (input.type) {
        case 'number':
        case 'range':
            return 'number';
        case 'checkbox':
            return 'boolean';
        case 'radio':
        case 'text':
        case 'email':
        case 'password':
        case 'search':
        case 'tel':
        case 'url':
        case 'date':
        case 'datetime-local':
        case 'time':
        case 'hidden':
            return 'string';
        case 'file':
            return 'string'; // Could add contentEncoding: base64
        default:
            return 'string';
    }
}



/**
 * captures a webform’s FormData values and outputs them as a JavaScript object matching your JSON Schema.
 */
export function captureFormDataToSchemaFormat(formName, schema) {
    const form = document.forms[formName];
    const formData = new FormData(form);
    const result = {};

    for (const [key, value] of formData.entries()) {
        const propDef = schema.properties?.[key];

        if (!propDef) continue; // Skip fields not in schema

        let type = propDef.type;

        // Type conversion based on JSON Schema
        switch (type) {
            case "boolean":
                result[key] = value === "on" || value === "true";
                break;
            case "number":
                result[key] = parseFloat(value);
                break;
            case "integer":
                result[key] = parseInt(value, 10);
                break;
            case "string":
            default:
                result[key] = value;
                break;
        }

        // Handle multiple checkboxes or multi-select
        if (result.hasOwnProperty(key)) {
            if (Array.isArray(result[key])) {
                result[key].push(value);
            } else if (result[key] !== value) {
                result[key] = [result[key], value];
            }
        }
    }

    // Add unchecked checkboxes and radios explicitly as false or undefined
    for (const key in schema.properties) {
        const el = form.elements[key];
        if (!el) continue;

        const type = el.type;

        if ((type === "checkbox" || type === "radio") && !formData.has(key)) {
            if (schema.properties[key].type === "boolean") {
                result[key] = false;
            }
        }
    }

    return result;
}




