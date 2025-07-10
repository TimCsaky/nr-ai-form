const express = require('express');
import { Router, Request, Response, NextFunction } from "express";
const router = Router();

import { assistV1, assistV2 } from '../controllers/form';


router.get("/v1/health",
  async (req: Request, res: Response, next: NextFunction) => {
    res.status(201).json('ok');
  }
);


/**
 * returns assistance from our AI about a specific form field
 * uses conditional business log in cotroller to build an AI prompt
 */
router.post("/v1/:formId/assist/:fieldId",
  express.json(),
  async (req: Request, res: Response, next: NextFunction) => {
    const response = await assistV1(req.params.formId, req.params.fieldId, req.body);
    res.status(201).json(response);
  }
);

/**
 * returns assistance from our AI about a specific form field
 * receives a JSON representation of the client webform schema and data
 */
router.post("/v2/:formName/assist/:fieldName",

  // for demo, mockup validation middleware
  (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.get('Authorization');
    const client = JSON.parse(req.get('X-Form-Assist-Client') || '{}');
    const token = authHeader?.replace('Bearer ', '');
    console.log('auth token: ', token);
    if (!authHeader || !authHeader.startsWith('Bearer ') || token !== `${client.client}-abc`) {
      res.status(403).json({ valid: false, message: 'Token does not match client formId' });
    }
    next();
  },

  express.json(),
  async (req: Request, res: Response, next: NextFunction) => {
    const response = await assistV2(req, res, next)
    res.status(201).json(response);
  }
);


/**
 * for this demo..
 * mock up token endpoint and validation middleware
 * 
 * We could use some kind of hash.. based on client's url, id and our own cipher ??
 * one idea was to have the token be an MD5 hash of the current timestamp.
 * NOT FOR PRODUCTION USE
 */
router.get("/get-token", (req, res) => {
  const client = JSON.parse(req.get('X-Form-Assist-Client') || '{}');
  console.log(client);
  res.json({ token: `${client.client}-abc` });
});

export default router;
