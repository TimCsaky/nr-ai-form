/**
 * main script called by a client from their webpage
 * parses elements in the webpage's DOM to:
 * - create a JSON schema representing the form (input names, labels and data types)
 * - create a JSON object representing the form values (in a structure that conforms to the form schema)
 * note: <form> and input (input, textarea, select, radio etc) must have a 'name' attribute in the HTML 
 * 
 * Additional functions may be added to fetch more context from API's (for example the client's server)
 * 
 * When a user edits/focuses on an input, form schema and data is sent to our AI Form service,
 * which can take any action, such as query a RAG, do conditional logic, delegate an Agent. 
 */
/*
<!-- import like this: -->
<script>
const formAssistClient = {
    client: '79376007',
}
</script>
<script type="module" src="http://localhost:3000/script.js"></script>
*/

// import { buildJsonSchemaFromForm } from '../convert.js';

/**
 * Create chat iframe and give it auth token
 * When the iframe loads, have the parent page fetch a short-lived access token from the server.
 * Pass this token securely to the iframe using postMessage
 * This pattern prevents secrets from being visible in view source or dev tools 
 * and limits exposure to the token’s lifespan. 
 * 
 * that being said.. i'm not sure if we need to use this pattern. could get/validate token from iframe(?)
 */
let chatIframe;
// when parent webpage has loaded, 
// window.addEventListener('DOMContentLoaded', function (e) {
window.addEventListener("load", (event) => {
    // create chat iframe and add it to the parent html page (hidden for now)
    console.log('window load event fired, creating chat iframe');
    chatIframe = createChatIframe();

    // fetch a token to authenticatechat iframe with the chat service
    // TODO consider moving this proces to the ifram.. no need to get token in parent
    chatIframe.onload = () => {
        fetchTokenAndPostToChatIframe(chatIframe);
    };
});

// Create chat iframe element and add it to the page
function createChatIframe() {
    var chatIframe = document.createElement('iframe');
    chatIframe.id = "chat-iframe";
    chatIframe.src = "http://localhost:3000/chat.html"; // origin is currently in /public directory of our AI Form API 
    chatIframe.style.display = "none"; // keep it hidden for now
    chatIframe.style.position = "fixed";
    chatIframe.style.bottom = "20px";
    chatIframe.style.right = "20px";
    chatIframe.style.width = "500px";
    chatIframe.style.height = "400px";
    chatIframe.style.zIndex = "10000";
    chatIframe.style.backgroundColor = "white";
    chatIframe.style.border = "1px solid blue";
    chatIframe.style.padding = "20px";
    chatIframe.style.borderRadius = "5px";
    document.body.appendChild(chatIframe);
    return chatIframe;
}



// fetch a short-lived access token and post it to the iframe securely
// this token is used to authenticate the iframe with the chat service
function fetchTokenAndPostToChatIframe(chatIframe) {
    // get token from our api
    const headers = {
        'Content-Type': 'application/json',
        'X-Form-Assist-Client': JSON.stringify(formAssistClient)
    };
    fetch('http://localhost:3000/api/get-token', { headers })
        .then(res => res.json())
        .then(data => {
            const token = data.token;
            // Pass the token securely to the chat iframe using postMessage
            chatIframe.contentWindow.postMessage(
                { type: 'auth', token },
                'http://localhost:3000/chat.html' // url of the iframe
            );
        });
}


// ----- show Form Assistant
// when a form field is focused
function onInputFocus() {

    document.addEventListener('input', function (e) {
        const target = e.target;
        if (
            target.tagName === 'INPUT' ||
            target.tagName === 'TEXTAREA' ||
            target.tagName === 'SELECT'
        ) {

            const form = target.closest('form');
            // for demo.. to avoid conflict with other demo
            if (form.name !== 'water') return;
            // if (!form || !form.name) {
            //     alert(`AI Form service requires form and inputs to have a 'name' attribute `);
            //     return;
            // }

            // Show iframe 
            chatIframe.style.display = "block";

            // get form schema - scrape DOM for input elements
            const formSchema = buildJsonSchemaFromForm(form);
            // create payload for our AI service
            const data = {
                ...formAssistClient, // add client ID
                formName: form.name,
                formSchema: formSchema,
                formData: Object.fromEntries((new FormData(form)).entries()),
                fieldName: target.name,
            };

            // post data to chat iframe
            // TODO: consider fetching new token here if it has expired
            chatIframe.contentWindow.postMessage(
                { type: 'form', data },
                'http://localhost:3000/chat.html' // the iframe's origin
            );
        }
    });
}
onInputFocus();


function buildJsonSchemaFromForm(form) {

    const schema = {
        $schema: "http://json-schema.org/draft-07/schema#",
        type: "object",
        title: "Web Form Schema",
        name: form.name,
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

// Listen for messages from the parent window
window.addEventListener('message', (event) => {
    if (event.data.type === 'hideChat') {
        chatIframe.style.display = "none";
    }
});