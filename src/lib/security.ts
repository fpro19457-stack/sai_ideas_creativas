export function sanitizeText(input: string, maxLength = 500): string {
  return input
    .replace(/<[^>]*>/g, "")
    .replace(/[<>'"]/g, "")
    .trim()
    .slice(0, maxLength);
}

export function sanitizePhone(phone: string): string {
  return phone.replace(/\D/g, "");
}