import axios from 'axios';
import { UssdSessions } from '../models';
import settings from '../config/settings';

class VpayUssd {
  constructor(pryussdReq, token) {
    const { msisdn, sessionid, network, ussdinput } = pryussdReq;
    this.msisdn = msisdn[0];
    this.sessionid = sessionid[0];
    this.network = network[0];
    this.ussdinput = ussdinput[0];
    this.themessage = `ABC Banking Menu
      1. Transfer Money
      2. Check Account balance
      3. Check Transactions
      4. Topup Airtime
      5. Veepay
      6. Pay Utilities`;
    this.accessToken = token;
  }
  /**
   *
   * @param {String} message
   * @param {Boolean} respcode
   * @param {Boolean} continue
   */
  response(message, success = true, isContinue = true) {
    const respState = success
      ? { respcode: 0, respmsg: 'success' }
      : { respcode: 1, respmsg: 'failed' };
    const contEnd = isContinue ? 'continue' : 'end';
    return `
        <pryussd_resp>
            <ussdmsg>${message}</ussdmsg> 
            <respcode>${respState.respcode}</respcode>  
            <respmsg>${respState.respmsg}</respmsg>  
            <resptype>${contEnd}</resptype> 
        </pryussd_resp>`;
  }

  async handleUserRequest() {
    try {
      const ssid = await UssdSessions.findOne({
        where: {
          sessionid: this.sessionid,
          msisdn: this.msisdn,
        },
      });
      if (!ssid) {
        // create new session for this user
        await UssdSessions.create({
          msisdn: this.msisdn,
          sessionid: this.sessionid,
          network: this.network,
          input: this.ussdinput,
          menulevel: 0,
          
        });
        return this.response(this.themessage);
      }

      // the session. check the stage
      if (ssid.menulevel === 0) {
        // check the menu selection
        // check the import of the user
        const uinput = parseInt(this.ussdinput, 10);
        if (uinput === 1) {
          // transaction details
          ssid.update({ menulevel: 1, stage: 0 });
          return this.response('Enter Destination Account');
        }
        if (uinput === 2) {
          // transaction history
          ssid.update({ menulevel: 1, stage: 1 });
          return this.response('Enter Account PIN');
        }
        if (uinput === 3) {
          // verify vrc or vin
          // respond back with the message = Enter VRC or VIN
          // move the ussd menulevel to 1
          ssid.update({ menulevel: 1, stage: 2 });
          return this.response('Enter PIN');
        }
        if (uinput === 4) {
          // agent account status
          ssid.update({ menulevel: 1, stage: 3 });
          return this.response('Enter Amount');
        }
        if (uinput === 5) {
          // manage agent
          ssid.update({ menulevel: 1, stage: 4 });
          return this.response('Enter Veepay Number/Veepay Invoice Number');
        }
        if (uinput === 6) {
          ssid.update({ menulevel: 1, stage: 5 });
          return this.response('Enter Merchant Number');
        }
        return this.response(this.themessage);
      } else if (ssid.menulevel === 1) {
        if (ssid.stage === 0) {
          ssid.destroy();
          return this.response(
            `Destination Account is ${this.ussdinput}`,
            true,
            false
          );
        }
        if (ssid.stage === 1) {
          ssid.destroy();
          return this.response(`Account PIN is ${this.ussdinput}`, true, false);
        }
        if (ssid.stage === 2) {
          ssid.destroy();
          return this.response(`PIN is ${this.ussdinput}`, true, false);
        }
        if (ssid.stage === 3) {
          // you have the agent code.....
          ssid.destroy();
          return this.response(
            `Your Account will be credited with an amount of ${this.ussdinput}`,
            true,
            false
          );
        }
        if (ssid.stage === 4) {
          ssid.update({ menulevel: 2, stage: 0, vrc: this.ussdinput });
          if (this.ussdinput && this.ussdinput.length < 8) {
            const vrcResPonse = await axios({
              url: `http://52.24.33.201/api/query/vrc/${this.ussdinput}`,
              method: 'get',
              headers: {
                'x-access-token': this.accessToken,
              },
            });

            const { data } = vrcResPonse;
            const agents = data.agents;
            const agno = parseInt(agents, 10);
            console.log(`Number of agents are ${agno}`);
            if (agno > 0) {
              ssid.update({ stage: 99 });
              return this.response(
                `${this.ussdinput}, ${data.name},${data.address}, ${data.city}, 
                Please enter agent number`,
                true,
                true
              );
            }
            return this.response(
              `${this.ussdinput}, ${data.name},${data.address}, ${data.city}, 
              Please enter amount`,
              true,
              true
            );
          }
          // VIN integrationi

          const vinResponse = await axios({
            url: `http://52.24.33.201/api/query/vin/${this.ussdinput}`,
            method: 'get',
            headers: {
              'x-access-token': this.accessToken,
            },
          });

          const { data } = vinResponse;
          return this.response(
            `${this.ussdinput}, ${data.name},${data.address
            }, ${data.city}, 
            Please enter amount`,
            true,
            true
          );
        }
      } else if (ssid.menulevel === 2) {
        if (ssid.stage === 99) {
          ssid.update({ menulevel: 2, stage: 0, agentNumber: this.ussdinput });
          const vinResponse = await axios({
            url: `http://52.24.33.201/api/query/agent/${ssid.vrc}/${this.ussdinput}`,
            method: 'get',
            headers: {
              'x-access-token': this.accessToken,
            },
          });

          const { data } = vinResponse;
          return this.response(
            `Agent is, ${data.name}, 
            Please enter amount`,
            true,
            true
          );
        }
        ssid.update({ menulevel: 3, stage: 0, amount: this.ussdinput });
        return this.response('Enter Reference');
      } else if (ssid.menulevel === 3) {
        ssid.update({ menulevel: 4, stage: 0 });
        if (ssid.stage === 0) {
          return this.response(
            `GHS ${ssid.amount} will be debited from your account.
             Enter Pin to Proceed`
          );
        }
      } else if (ssid.menulevel === 4) {
        const myConfig = {
          headers: {
            'x-access-token': this.accessToken,
          },
        };
        if (ssid.stage === 0) {
          // we now have the pin then we debit the persons account
          const transid = Math.random().toString(36).substring(7);
          const results = await axios.post(
            settings.paymentUrl,
            {
              vrc: ssid.vrc,
              amount: ssid.amount,
              agentcode: ssid.agentNumber,
              transactionid: transid,
              referencemsg: this.ussdinput,
            },
            myConfig
          );
          console.log(results);
          const { data } = results;

          const smsResults = await axios.post(
            settings.infobipSmsUrl,
            {
              from: 'ABC Bank',
              to: this.msisdn,
              text: `Your Account 89990XXXXXX02 has been debited with GHS ${ssid.amount}, ${data.date}. Ref: ${data.referenceid}.Balance: GHS 5000.00. Helpline: +233 24408xxx8`,
            },
            auths,
            config,
          );
          // const { messages } = smsResults;
          console.log(smsResults);
          ssid.destroy();
          return this.response(
            `Transaction ID ${data.transactionid}, Reference ${data.referenceid}.
            Your account has been debited with GHS ${ssid.amount} successfully, Thank you!`,
            true,
            false
          );
        }
      }
    } catch (error) {
      console.log(error); //eslint-disable-line
      return this.response(
        'An unknown error has occured. Please try again',
        false,
        false
      );
    }
  }
}
const config = {
  headers: { 'Content-Type': 'application/json' },
};

const auths = {
  auth: {
    username: settings.infobipUser,
    password: settings.infobipPass,
  },
};

class UssdController {
  async ussdRequest(req, res) {
    try {
      if (!req.session.token) {
        // console.log('getting a new token');
        const results = await axios.post(
          settings.loginurl,
          {
            apikey: settings.apikey,
            secret: settings.secret,
          },
          config
        );
        const { data } = results;
        req.session.token = data.token; // eslint-disable-line
        const hour = 3600000 * 23;
        req.session.cookie.expires = new Date(Date.now() + hour); //eslint-disable-line
      } else {
        // check if the session has expired.
        // console.log('using token=', req.session.token);
      }

      const ussdRequest = req.body.pryussd_req; // eslint-disable-line
      const ussdReq = new VpayUssd(ussdRequest, req.session.token);
      const response = await ussdReq.handleUserRequest();

      res.set('Content-Type', 'text/xml');
      res.status(201).send(response);
    } catch (error) {
      res.set('Content-Type', 'text/xml');
      res.status(201).send(`
      <pryussd_resp>
          <ussdmsg>Unknown error occurred. Try again</ussdmsg> 
          <respcode>1</respcode>  
          <respmsg>failed</respmsg>  
          <resptype>end</resptype> 
      </pryussd_resp>`);
    }
  }
}

export default UssdController;
