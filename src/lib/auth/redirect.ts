export function sanitizeAdminRedirect(value: string | null | undefined) {
  if (!value) {
    return "/admin";
  }

  if (
    !/^\/admin(?:[/?#]|$)/.test(value) ||
    value.startsWith("//") ||
    value.includes("\\") ||
    /[\u0000-\u001f]/.test(value)
  ) {
    return "/admin";
  }

  return value;
}
