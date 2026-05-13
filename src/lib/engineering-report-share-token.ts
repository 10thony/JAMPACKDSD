/**
 * Secret path segment for the mid-year engineering report share URL.
 * Anyone with this string can open the report; rotate by generating a new
 * value (`node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)
 * and updating this file, the `from`/`to` paths in `netlify.toml` (301 redirect),
 * then redeploying.
 */
export const ENGINEERING_REPORT_SHARE_TOKEN =
  'b187e405636e846418070d0b7dbd09a39d4d8f311771379bda441518b4987fac'
