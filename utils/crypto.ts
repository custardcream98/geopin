import CryptoJs from "crypto-js";

export const encode = (target: string) => {
  const wordArray = CryptoJs.enc.Utf16.parse(target);
  const base64 =
    CryptoJs.enc.Base64url.stringify(wordArray);

  return base64;
};

export const decode = (target: string) => {
  const parsedWordArray =
    CryptoJs.enc.Base64url.parse(target);
  const parsedStr = parsedWordArray.toString(
    CryptoJs.enc.Utf16
  );

  return parsedStr;
};
