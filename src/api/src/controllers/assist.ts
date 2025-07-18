import { getAiResponse } from '../services/aiService';
import { Request, Response, NextFunction } from "express";


/**
 * * Assists with a webform field using AI
 * does conditional logic based on other values in the form data
 * passes a prompt to the AI service
 */
export const assistV1 = async (req: Request, res: Response, next: NextFunction) => {

  const fieldName = req.body.fieldName;
  const formData = req.body.formData;
  let prompt;
  let response = {
    fieldName: fieldName,
    aiResponse: 'No assistance available'
  };

  try {
    /**
     * simulate some conditional business login
     * this could be defined in a separate schema provided by the client
     */
    switch (fieldName) {

      case "location":
        if (formData[fieldName].toLowerCase() !== 'victoria' && formData[fieldName].toLowerCase() !== 'vancouver') {
          prompt = `List some cities in British Columbia`;
          response.aiResponse = (await getAiResponse(prompt)).choices[0].message.content;
        } else {
          response.aiResponse = 'This response looks valid';
        };
        break;

      case "office":
        prompt = `Show me ${req.body.fieldHelp} in ${formData['location']}`
        console.log(prompt);
        response.aiResponse = (await getAiResponse(prompt)).choices[0].message.content;
        break;
    }
    return response
  } catch (error: any) {
    console.error('Error in assist:', error);
    throw new Error(`Failed to assist with field ${req.body.fieldName}: ${error.message}`);
  }
};


/**
 * another experiemntal process..
 * - uses a JSON representation of the client webform (formSchema) and the input values (formData)
 * - merges 'context' (eg: business logic or validation) from additional sources
 * - triggers AI agent (?)
 */
export const assistV2 = async (req: Request, res: Response, next: NextFunction) => {
  try {
    /**
     * simulate some conditional business login
     * this could be defined in a separate schema provided by the client
     */

    console.log('client webform data:', req.body);

    const fieldName = req.body.fieldName;
    const formSchema = req.body.formSchema;
    const formData = req.body.formData;
    let response = {
      fieldName: fieldName,
      aiResponse: 'No assistance available'
    };
    
    switch (fieldName) {
      // if doing an ai prompt based on label
      case "weather":
        const label = formSchema.properties[fieldName].label;
        const aiResponse = (await getAiResponse(label)).choices[0].message.content;
        response.aiResponse = aiResponse;
        break;

      case "walk":
        // eg: if weather input includes word 'wet'..
        if ((formData.weather).includes('wet')) {
          response.aiResponse = 'It usually rains. We recommend answering No';
        }
        break;

      case "coat":
        // eg: if walk input is 'no'
        if ((formData.walk) === 'No') {
          response.aiResponse = 'You indicated you will not walk. You won\'t need a coat.';
        }
        break;
    }
    return response
  } catch (error: any) {
    console.error('Error in assist:', error);
    throw new Error(`Failed to help with form: ${error.message}`);
  }
};
