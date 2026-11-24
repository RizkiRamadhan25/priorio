export function allowedMutation(headers: Pick<Headers, "get">, port = process.env.PRIORIO_PORT ?? "3000") {
  const host = "127.0.0.1:" + port;
  const forwardedHost = headers.get("x-forwarded-host");
  return headers.get("host") === host && headers.get("origin") === "http://" + host &&
    (!forwardedHost || forwardedHost === host);
}
