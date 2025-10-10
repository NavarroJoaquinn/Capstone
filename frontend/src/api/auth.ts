import { AUTH, api } from "./client";

export type LoginBody = { email: string; password: string };
export type LoginResp = { access_token: string };

export async function login(body: LoginBody): Promise<LoginResp> {
  return api(`${AUTH}/auth/login`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}