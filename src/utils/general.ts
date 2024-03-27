export function formatToInternational(numberToFormat: string | number) {
  numberToFormat = Number(Number(numberToFormat).toFixed(2));
  const formattedNumber = new Intl.NumberFormat("en-US").format(numberToFormat);
  return formattedNumber;
}

export function toTitleCase(str: string) {
  return str.replace(/\b\w/g, function (char) {
    return char.toUpperCase();
  });
}

export function getRandomInteger() {
  // Generate a random number between 0 and 1
  const random = Math.random();

  // Scale the random number to fit within the desired range
  const scaled = Math.floor(random * (89 - 70 + 1)) + 70;

  return scaled;
}

// eslint-disable-next-line
export function replicate(obj: any) {
  return JSON.parse(JSON.stringify(obj));
}

export function formatNumber(num: string | number) {
  if (isNaN(Number(num))) return num;
  num = Number(num);

  const formatter = new Intl.NumberFormat("en-US", {
    notation: "compact",
    compactDisplay: "short",
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });

  return formatter.format(num);
}

export function roundUpToDecimalPlace(
  number: string | number,
  decimalPlaces: number
) {
  number = Number(number);

  const factor = 10 ** decimalPlaces;
  return Math.ceil(number * factor) / factor;
}

export function getRandomNumber(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateRandomDigit() {
  return Math.floor(Math.random() * 10).toString();
}

export function generateRandomID() {
  const part1 = Array.from({ length: 11 }, generateRandomDigit).join("");
  const part2 = Array.from({ length: 21 }, generateRandomDigit).join("");
  const part3 = Array.from({ length: 7 }, generateRandomDigit).join("");

  return `${part1}-${part2}-${part3}`;
}
