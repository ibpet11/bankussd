'use strict';
import ussd from './ussd';

export const routting = (app) => {
  app.use('/ussd', ussd);
};
