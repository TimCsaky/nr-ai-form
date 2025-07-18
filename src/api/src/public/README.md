### Frontend integration script

This file serves as the main script called by a client from their webpage.
It's overall purpose is to understand the webform and business context and provide an AI Assistance UI that connects to our AI Form Service.

* To understand the webform, the script parses elements in the webpage's DOM to:
 - create a JSON schema representing the form (input names, labels and data types)
 - create a JSON object representing the form values (in a structure that conforms to the form schema)
Note: `<form>` and input elements must have 'name' attribute.<br />
Additional functions may be added to fetch data from API's (for example the client's server)
 
* When user edits/focuses on an input, all this data (form shema, data, context) is sent to our AI Form service via a chat UI in an iframe which could in theory take other actions, such as query a RAG, do conditional logic, delegate an Agent. 

Additional scripts to create help links in the clients webform.. and reference other attributes of the DOM can be found [here](https://github.com/TimCsaky/aif-client-1/blob/dev/src/views/v1.vue) that could be aded to this main script.

client webpage imports this script like this:

```html
<script>
const formAssistClient = {
    client: '79376007',
}
</script>
<script type="module" src="http://localhost:3000/script.js"></script>
```

Note: It may be prefable to host this public script in github pages or a CDN (?)
However, I believe there are benefits in terms of securiy and function if the iframe.html and scripts originate from the same domain as our API.. to be determined.