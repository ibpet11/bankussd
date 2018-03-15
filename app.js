import express from 'express';
// import favicon from 'serve-favicon';
import logger from 'morgan';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import helmet from 'helmet';
import session from 'express-session';
import cors from 'cors';
import xmlparser from 'express-xml-bodyparser';
import xmljs from 'xml2js';

import { routting } from './routes';

const app = express();

const isDev = app.get('env') === 'development';

const stripPrefix = xmljs.processors.stripPrefix;

// use helmet
app.use(helmet());

app.use(cors());

if (isDev) {
  app.use(logger('dev'));
} else {
  app.use(logger('common'));
  app.disable('x-powered-by');
}
app.use(
  xmlparser({
    tagNameProcessors: [stripPrefix],
  })
);
// uncomment after placing your favicon in /public
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);

app.use(cookieParser());

const memoryStore = session.MemoryStore;
app.use(
  session({
    name: 'ussd.sid',
    secret: 'SLDFASLDKJAFSLDKJ',
    resave: true,
    saveUninitialized: true,
    store: new memoryStore(),
  })
);

// import the routing
routting(app);

module.exports = app;
