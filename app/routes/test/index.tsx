import { json } from "@remix-run/node";
import { cors } from "remix-utils/cors";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { checkRequestType } from "app/utils/auth.util";

export async function loader({ request }: LoaderFunctionArgs) {
  // Handle preflight OPTIONS request
  if (request.method === "OPTIONS") {
    const response = json({ status: 200 });
    return await cors(request, response);
  }

  const response = json({
    success: true,
    message: "CORS fixed! 🚀",
  });

  return cors(request, response);
}

export async function action({ request }: ActionFunctionArgs) {
  // Handle preflight OPTIONS request
  console.log("hello world!!!", "sagy233");
  console.log("sagy301", process.env.APP_BASE_URL);

  if (request.method === "OPTIONS") {
    const response = json({ status: 200 });
    return await cors(request, response);
  }
  const requestObject = await checkRequestType(request);
  console.log(
    "sagy400",
    "requestObject.isAdmin",
    requestObject.isAdmin,
    "requestObject.isSession",
    requestObject.isSession,
  );

  try {
    const data = await request.json();
    return cors(
      request,
      json({
        success: true,
        message: "Request received!",
        hell: "yes!",
        data,
      }),
    );
  } catch (error: any) {
    return cors(
      request,
      json({
        success: false,
        message: "Error processing request",
        error: error.message,
      }),
    );
  }
}
