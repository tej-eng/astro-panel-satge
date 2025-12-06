// import { NextResponse } from "next/server"

// export function middleware(request) {
//   // This middleware can be used to modify requests if needed
//   return NextResponse.next()
// }

// export const config = {
//   matcher: [
//     /*
//      * Match all request paths except for the ones starting with:
//      * - api (API routes)
//      * - _next/static (static files)
//      * - _next/image (image optimization files)
//      * - favicon.ico (favicon file)
//      */
//     "/((?!api|_next/static|_next/image|favicon.ico).*)",
//   ],
// }

import { NextResponse } from "next/server";

export function middleware(req) {
  const token = req.cookies.get("token"); 

  if (!token && req.nextUrl.pathname === "/dashboard") {
    return NextResponse.redirect(new URL("/", req.url)); 
  }

  return NextResponse.next(); 
}

export const config = {
  matcher: ["/dashboard"], 
};
