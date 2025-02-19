export {};

declare global {
    interface String {
        capitalize(): string;
        capitalizeAll(): string;
        isNumeric(): boolean;
    }
}

String.prototype.capitalize = function (): string {
    return this[0].toUpperCase() + this.slice(1);
}

String.prototype.capitalizeAll = function (): string {
    return this.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
}

String.prototype.isNumeric = function (): boolean {
    return ((this != null) &&
           (this !== '') &&
           !isNaN(Number(this.toString())));
}

export function factorial(x) {
    if(x==0) {
       return 1;
    }
    return x * factorial(x-1);
 }

export function binomial(n = 1, p = 0.5) {

    let i = 0
    let x = 0

    while (i++ < n) {
        if (Math.random() < p) {
            x++
        }
    }
    return x
}