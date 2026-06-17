import { NextResponse } from "next/server";

// 认证改为 cookie + tRPC 层校验，不在中间件做路由保护（替代原 Clerk 中间件）
export default function proxy() {
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
