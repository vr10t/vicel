import { NextApiRequest } from "next";
import UAParser from "ua-parser-js";

export function logRequest(req: NextApiRequest, input?: any) {
  const userAgent = new UAParser(req.headers["user-agent"]);
  const browser = userAgent.getBrowser();
  const os = userAgent.getOS();
  const device = userAgent.getDevice();
  const page = req.headers.referer || req.headers.origin;
  const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;

  console.log(
    `User Agent: ${browser.name} ${browser.version}, 
    OS ${os.name} ${os.version}, 
    Device Model ${device.model}, 
    IP ${ip}, 
    requested function ${req.url?.split("?batch")[0]}, 
    at ${new Date().toLocaleString()}, 
    from page ${page}, 
    with input ${JSON.stringify(input ?? req.body)}`
  );
}

export function logApiRequest(req: NextApiRequest, input?: any) {
  const path = req.url;
  const { method } = req;
  const { body } = req;

  console.log(
    `API Request
    Date: ${new Date().toLocaleString()}
    Path: ${path}
    Method: ${method}
    Body: ${JSON.stringify(body)}
    Input: ${JSON.stringify(input)}`
  );
}

