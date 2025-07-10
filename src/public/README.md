### Frontend integration script

(public scripts served from https://our-api-url.com/script.js)
This file serves as the main script called by a client from their webpage.
It's overall purpose is to understand the webform and business context and provide an AI Assistance UI that connects to our AI Form Service.

To understand the webform, the script parses elements in the webpage's DOM to:
 - create a JSON schema representing the form (input names, labels and data types)
 - create a JSON object representing the form values (in a structure that conforms to the form schema)
Note: `<form>` element must have an 'id' attribute and input elements must have 'name' attribute 
Additional functions may be added to fetch data from API's (for example the client's server)
 
When a user edits/focuses on an input, all this data (form shema, data, context) is sent to our AI Form service, which can take any action, such as query a RAG, do conditional logic, delegate an Agent. 
