export function calculateAge(birthDate: Date): number {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

export function generateBirthDateFromAge(age: number): Date {
  const today = new Date();
  return new Date(today.getFullYear() - age, 0, 1);
}

export function parseDate(dateString: string): Date | undefined {
  if (dateString && /^\d+$/.test(dateString)) {
    return new Date(parseInt(dateString));
  } else if (Date.parse(dateString)) {
    return new Date(dateString);
  }
  return undefined;
}
