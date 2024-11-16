export function addrEq(a: string, b: string) {
  return a?.toLowerCase() == b?.toLowerCase();
}

export function addrInclude(addrList: string[], addr: string) {
  return addrList?.some(a => addrEq(a, addr));
}

export function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function displayAddress(address: string | any[]) {
  const len = address?.length;
  return address && `${address.slice(0, 6)}...${address.slice(len - 4, len)}`;
}
export function displayHash(hash: string | any[]) {
  const len = hash?.length;
  return hash && `${hash.slice(0, 10)}...${hash.slice(len - 8, len)}`;
}

export function displayAddressAsName(address: string | any[]) {
  const len = address?.length;
  return address && `${address.slice(0, 4)}...${address.slice(len - 4, len)}`;
}

export function line2Hump(str: string) {
  return str.replace(/\-(\w)/g, (all, letter) => letter.toUpperCase());
}
export function hump2Line(str: string) {
  return str
    .replace(/([A-Z])/g, "-$1")
    .toLowerCase()
    .substring(1);
}

export function fillData2Str(
  str: string,
  data: { [x: string]: any },
  deleteKey = true,
  re = /{(.+?)}/g,
) {
  let res = str,
    match;

  while ((match = re.exec(str)) !== null) {
    res = res.replace(match[0], data[match[1]] + (match[2] || ""));
    if (deleteKey) delete data[match[1]];
  }
  return res;
}
// export function fillData2StrInSignText(str, data, deleteKey = true) {
// 	return this.fillData2Str(str, data, deleteKey, /\${(.+?)}/g)
// }
export function fillData2StrInUrl(str: string, data: any, deleteKey = true) {
  return fillData2Str(str, data, deleteKey, /:(.+?)(\/|$|&|\.)/g);
}

export function num2Str(num: number | string, decimal?: number) {
  if (typeof num == "number" && decimal) num = num.toFixed(decimal);
  if (typeof num == "number") num = Math.floor(num * 10000000) / 10000000;
  const numString: string = num.toString();

  const parts: string[] = numString.split(".");
  const integerPart: string = parts[0];
  const decimalPart: string = parts[1] || "";

  const integerWithCommas: string = integerPart.replace(
    /\B(?=(\d{3})+(?!\d))/g,
    ",",
  );

  return decimalPart
    ? `${integerWithCommas}.${decimalPart}`
    : integerWithCommas;
}
