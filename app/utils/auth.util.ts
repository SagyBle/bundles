// import shopify from './shopify'; // Adjust the import path accordingly
// import { authenticate } from './auth'; // Adjust the import path accordingly
import { authenticate } from "app/shopify.server";

export async function checkRequestType(request: Request) {
  let isAdmin = false;
  let admin: any = undefined;
  let isSession = false;
  let session: any = undefined;

  try {
    const authAdmin = await authenticate.admin(request);
    admin = authAdmin?.admin || null;
    if (admin) isAdmin = true;
  } catch (error) {
    console.error("Admin authentication failed:", error);
  }

  try {
    const authSession = await authenticate.public.appProxy(request);
    session = authSession?.session || null;
    if (session) isSession = true;
  } catch (error) {
    console.error("Session authentication failed:", error);
  }

  return { isAdmin, isSession, admin, session };
}
