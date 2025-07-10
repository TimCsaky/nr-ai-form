# AI Form API

Note: This application is very much in the IDEAS stage and experimental.

It has only been tested locally (on http://localhost:3000)
An example client can be count in repo: https://github.com/TimCsaky/aif-client-1/tree/static

to start server in a development environment run:

```bash
npm run dev
```

## API has endpoints to:

* GET assistance (or trigger an action) from the user's browser (when filling in the form)
  see: route /api/v2/:formName/assist/:fieldName 
  currently the payload includes:
  - form schema (a JSON representation of the webform as found in the DOM or obtained via client's api)
  - the existing doem values (data already input into the webform by the user)
  - the form field identifier that was clicked or referenced at time of request

* (TBD) index a client's knowledge base (eg PDF's and public webpages)
  creates a RAG (model embeddings) and a space in our database for each client.
  this could be done manually for the POC

* (TBD) PUT an 'agent configuration file' (specific to a single client's webform)
  this will tell a process (eg: our service, an MCP server or AI Agent (??) what to do with the user's form data 
