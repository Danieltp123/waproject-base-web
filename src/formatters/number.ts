export function convertCurrency(value: number) {
    const str = `R$ ${value.toFixed(2)}`.replace('.', ',');
    return str;
}
