/**
 * This file serves as the main script called by a client from their webpage
 * It's overall purpose is to understand the webform and business context,
 * 
 * To acheive this the javascript parses elements in the webpage's DOM to:
 * - create a JSON schema representing the form (input names, labels and data types)
 * - create a JSON object representing the form values (in a structure that conforms to the form schema)
 * note: <form> element must have an 'id' attribute and input elements must have 'name' attribute 
 * 
 * Additional functions may be added to fetch data from API's (for example the client's server)
 * 
 * When a user edits/focuses on an input, all this data (form shema, data, context) is sent to our AI Form service,
 * which can take any action, such as query a RAG, do conditional logic, delegate an Agent. 
 * 
 */
/*
<script>
const formAssistClient = {
    client: '79376007',
    url: window.location.href
}
</script>
<script type="module" src="http://localhost:3000/script.js"></script>
*/

// script for creating a JSON schema from DOM form elements
import { buildJsonSchemaFromForm, captureFormDataToSchemaFormat } from '../convert.js';


// a variable defined in client's webpage
console.log('client:', formAssistClient);

/**
 * Create chat iframe and give it authentcation token
 * When the iframe loads, have the parent page fetch a short-lived access token from the server.
 * Pass this token securely to the iframe using postMessage
 * This pattern prevents secrets from being visible in view source or dev tools 
 * and limits exposure to the token’s lifespan. 
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
    chatIframe.src = "http://localhost:3000/chat.html"; // iframe's origin
    // chatIframe.sandbox = "allow-same-origin"
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
// note in retrospect, there's no reason why we cant do this from the iframe itself to simplify
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
            console.log('auth token received:', token);
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

            const parentForm = target.closest('form');

            console.log(parentForm.name);


            const formName = parentForm.name;
            // if (!parentForm || !formName) {
            //     alert(`AI Form service requires inputs to 
            //         have a 'name' attribute and a parent form element with a 'name' attribute`);
            //     return;
            // }

            // Show chat iframe 
            chatIframe.style.display = "block";

            // get form schema
            // scrape DOM for input elements
            const formSchema = buildJsonSchemaFromForm(formName);
            const formData = captureFormDataToSchemaFormat(formName, formSchema);
            // create full payload for our AI service
            const data = {
                ...formAssistClient, // add client ID
                formName: formName,
                formSchema: formSchema,
                formData: formData,
                fieldWithFocus: target.name,
            };

            console.log('data:', data);
            // post data to chat iframe
            // this will be used by the chat service to assist the user
            // TODO: consider fetching new token here if it has expired
            chatIframe.contentWindow.postMessage(
                { type: 'form', data },
                'http://localhost:3000/chat.html' // the iframe's origin
            );
        }
    });
}
onInputFocus();


// Listen for messages from the parent window
window.addEventListener('message', (event) => {

    console.log('message received in iframe:');

    if (event.data.type === 'hideChat') {
        chatIframe.style.display = "none";
    }

});


