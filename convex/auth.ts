import type { GenericMutationCtx, GenericQueryCtx } from "convex/server";
import type { DataModel } from "./_generated/dataModel";

export const AUTHORIZED_USER_ID = "user_2yeq7o5pXddjNeLFDpoz5tTwkWS";

type AuthCtx = GenericMutationCtx<DataModel> | GenericQueryCtx<DataModel>;

export async function checkAuthorization(ctx: AuthCtx): Promise<void> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity || identity.subject !== AUTHORIZED_USER_ID) {
    throw new Error("Unauthorized: Only the authorized user can perform this action");
  }
}

export async function isAdminUser(ctx: AuthCtx): Promise<boolean> {
  const identity = await ctx.auth.getUserIdentity();
  return identity?.subject === AUTHORIZED_USER_ID;
}
