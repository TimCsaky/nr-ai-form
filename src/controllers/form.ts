import { getAiResponse } from '../services/aiService';

/**
 * * Assists with a webform field using AI
 * does conditional logic based on other values in the form data
 * passes a prompt to the AI service
 * 
 * @param formId - The ID of the form
 * @param fieldId - The ID of the field to assist with
 * @param data - object containing blah blah
 */
export const assistV1 = async (formId: String, fieldId: String, data: any) => {
  try {
    console.log(`Assisting with field ${fieldId} in form ${formId}, data:`, data);

    /**
     * builds a prompt somehow using 'context' (business or validation logic) associated with the form
     * This would in production be done elsewhere
     * for example by referencing a RAG, client-supplied validation rules, or other business logic
     */
    let prompt, aiResponse;

    /**
     * The following condiitonal logic would instead be handles b
     * 
     */
    if (fieldId === '0') {
      if (data.formData['0'].toLowerCase() !== 'victoria' && data.formData['0'].toLowerCase() !== 'vancouver') {
        prompt = `List some cities in British Columbia`;
        aiResponse = (await getAiResponse(prompt)).choices[0].message.content;
      }
      else {
        aiResponse = 'This response looks valid';
      };
    }
    if (fieldId === '1') {


      prompt = `Show me ${data.fieldHelp} in ${data.formData['0']}`
      console.log(prompt);

      aiResponse = (await getAiResponse(prompt)).choices[0].message.content;
    }

    // create API response
    const response = {
      formId: formId,
      fieldId: fieldId,
      aiResponse: aiResponse,
    }

    return response

  } catch (error: any) {
    console.error('Error in assist:', error);
    throw new Error(`Failed to assist with field ${fieldId} in form ${formId}: ${error.message}`);
  }
};


/**
 * another experiemntal process
 * - uses a JSON representation of the client webform
 * - merges 'context' (eg: business logic or validation) from additional sources
 * - triggers AI agent (?)
 */
export const assistV2 = async (req: any, res: any, next: any) => {
  try {
    // console.log(`Assisting with field ${req.params.fieldName} in form ${req.params.formName}, data:`, req.body);

    /**
     * simulate some conditional business login
     * this could be defined in a separate schema provided by the client
     */
    const fieldName = req.params.fieldName;
    let response = {
      fieldName: fieldName,
      aiResponse: 'No assistance available'
    };
    switch (fieldName) {
      // if doing an ai prompt based on label
      case "weather":
        const label = req.body.formSchema.properties[fieldName].label;
        const aiResponse = (await getAiResponse(label)).choices[0].message.content;
        response = {
          fieldName: fieldName,
          aiResponse: aiResponse,
        }
        break;

      case "walk":
        // eg: if input1 includes word 'rain'..
        if ((req.body.formData.weather).includes('wet')) {
          response = {
            fieldName: fieldName,
            aiResponse: 'It usually rains. We recommend answering No'
          }
        }
        break;

      case "coat":
        // eg: if input1 includes word 'rain'..
        if ((req.body.formData.walk) === 'No') {
          response = {
            fieldName: fieldName,
            aiResponse: 'You indicated you will not walk. You won\'t need a coat.'
          }
        }
        break;
    }
    return response
  } catch (error: any) {
    console.error('Error in assist:', error);
    throw new Error(`Failed to help with form: ${error.message}`);
  }

};
