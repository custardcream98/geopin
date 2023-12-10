const ADDRESS_REGEX =
  /(([가-힣]{1,}구)|([가-힣A-Za-z·\d~\-\.]{2,}(로|길).[\d]+)|([가-힣A-Za-z·\d~\-\.]+(읍|동)\s)[\d]+)/;

export const isAddress = (addressAble: string) => {
  return ADDRESS_REGEX.exec(addressAble) !== null;
};
