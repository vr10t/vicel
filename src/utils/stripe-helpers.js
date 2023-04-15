export function formatAmountForDisplay(amount, currency) {
  const numberFormat = new Intl.NumberFormat(["en-GB"], {
    style: "currency",
    currency,
    currencyDisplay: "symbol",
  });
  return numberFormat.format(amount);
}

export function formatAmountForStripe(amount, currency) {
  const numberFormat = new Intl.NumberFormat(["en-GB"], {
    style: "currency",
    currency,
    currencyDisplay: "symbol",
  });
  const parts = numberFormat.formatToParts(amount);
  let zeroDecimalCurrency = true;
  // eslint-disable-next-line no-restricted-syntax
  for (const part of parts) {
    if (part.type === "decimal") {
      zeroDecimalCurrency = false;
    }
  }
  return zeroDecimalCurrency ? amount : Math.round(amount * 100);
}
