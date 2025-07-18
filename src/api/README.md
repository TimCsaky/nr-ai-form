# AI Form API

Note: This application is very much in the IDEAS stage and experimental.

It has only been tested locally (on http://localhost:3000)<br />
An example client can be found in repo: https://github.com/TimCsaky/aif-client-1/tree/dev/

to start server in a development environment run:

```bash
npm run dev
```

to connect to our RAG/LLM in Azure you'll need to:
* put AI key in the .env file
* enable a SSH tunnel to our AI service (via Bastion):

```powershell
az network bastion ssh `
  --name aif `
  --resource-group aif `
  --target-resource-id "/subscriptions/    ... dev subscription id here ... /resourceGroups/aif/providers/Microsoft.Compute/virtualMachines/aif" `
  --auth-type ssh-key `
  --username azureuser `
  --ssh-key ".\Azure\tools-subscription-keys\vm ssh\aif_key.pem"

```

## API has endpoints to:

* get assistance (or trigger an action) from the user's browser (when filling in the form)
  see: route /api/v2/assist 
  currently the payload includes:
  - form schema (a JSON representation of the webform as found in the DOM or obtained via client's api)
  - the existing doem values (data already input into the webform by the user)
  - the form field identifier that was clicked or referenced at time of request<br />
  Note: there's aso a V1 version of this endpoint that supports the V1 demo in [aif-client-1](https://github.com/TimCsaky/aif-client-1/tree/dev/)


* (TBD) index a client's knowledge base (eg PDF's and public webpages)
  creates a RAG (model embeddings) and a space in our database for each client.
  this could be done manually for the POC

* (TBD) PUT an 'agent configuration file' (specific to a single client's webform)
  this will tell a process (eg: our service, an MCP server or AI Agent (??) what to do with the user's form data 
