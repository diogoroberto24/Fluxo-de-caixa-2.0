import { boolean, number } from "zod";

export interface IMoney {
  value: number;
  places?: number;
  isInteger?: boolean;
}

/**
 * Classe para manipulação de valores monetários
 * Converte entre float (reais) e inteiros (centavos)
 */
export class Money {
  private _centavos: number

  constructor(centavos: number) {
    this._centavos = Math.round(centavos)
  }

  static fromReais(reais: number): Money {
    return new Money(Math.round(reais * 100))
  }

  static fromCentavos(centavos: number): Money {
    return new Money(centavos)
  }

  static fromString(value: string): Money {
    // Remove caracteres não numéricos exceto vírgula e ponto
    const cleanValue = value.replace(/[^\d,.-]/g, '')
    
    // Converte vírgula para ponto se necessário
    const normalizedValue = cleanValue.replace(',', '.')
    
    const reais = parseFloat(normalizedValue) || 0
    return Money.fromReais(reais)
  }

  get centavos(): number {
    return this._centavos
  }

  get reais(): number {
    return this._centavos / 100
  }

  get formatted(): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(this.reais)
  }

  add(other: Money): Money {
    return new Money(this._centavos + other._centavos)
  }

  subtract(other: Money): Money {
    return new Money(this._centavos - other._centavos)
  }

  multiply(factor: number): Money {
    return new Money(Math.round(this._centavos * factor))
  }

  divide(divisor: number): Money {
    return new Money(Math.round(this._centavos / divisor))
  }

  equals(other: Money): boolean {
    return this._centavos === other._centavos
  }

  isGreaterThan(other: Money): boolean {
    return this._centavos > other._centavos
  }

  isLessThan(other: Money): boolean {
    return this._centavos < other._centavos
  }

  toString(): string {
    return this.formatted
  }

  toJSON(): number {
    return this._centavos
  }

  static zero(): Money {
    return new Money(0)
  }

  static sum(...values: Money[]): Money {
    return values.reduce((sum, current) => sum.add(current), Money.zero())
  }
}

// Funções utilitárias para conversão
export const formatMoney = (centavos: number): string => {
  return Money.fromCentavos(centavos).formatted
}

export const parseMoney = (value: string): number => {
  return Money.fromString(value).centavos
}

export const reaisTocentavos = (reais: number): number => {
  return Money.fromReais(reais).centavos
}

export const centavosToReais = (centavos: number): number => {
  return Money.fromCentavos(centavos).reais
}

/**
 * Classe alternativa para manipulação de valores monetários com mais funcionalidades
 */
export class MoneyAdvanced {
  input: number;
  value: number;
  places: number;
  isInteger: boolean;

  constructor(
    { value, places = 2, isInteger = false }: IMoney = {
      value: 0,
      places: 2,
      isInteger: false,
    }
  ) {
    this.input = value;
    this.value = value;
    this.places = places;
    this.isInteger = isInteger;

    if (!isInteger) {
      const [, decimal] = String(value).split(".");

      if (decimal?.length > this.places) this.places = decimal.length;

      this.value = MoneyAdvanced.floatToInteger(this.input, this.places);
      this.isInteger = true;
    }
  }

  toString() {
    return this.formatted;
  }

  toJSON() {
    return this.float;
  }

  get integer(): number {
    return this.value;
  }

  get float(): number {
    return MoneyAdvanced.integerToFloat(this.value, this.places);
  }

  get floatWithPlaces(): string {
    return this.float.toFixed(this.places);
  }

  get formatted(): string {
    const numbers = this.float.toFixed(2).replace(/\./, ",");

    return `R$ ${numbers}`;
  }

  add(value: MoneyAdvanced | IMoney | number): this {
    this.value += this.parseValue(value).integer;

    this.value = MoneyAdvanced.roundNumber(this.value);

    return this;
  }

  sub(value: MoneyAdvanced | IMoney): this {
    this.value -= this.parseValue(value).integer;

    this.value = MoneyAdvanced.roundNumber(this.value);

    return this;
  }

  mul(value: number): this {
    this.value *= value;

    this.value = MoneyAdvanced.roundNumber(this.value);

    return this;
  }

  div(value: number): this {
    this.value /= value;

    this.value = MoneyAdvanced.roundNumber(this.value);

    return this;
  }

  set(value: MoneyAdvanced | IMoney): this {
    let parsed: MoneyAdvanced;
    if (value instanceof MoneyAdvanced) parsed = value;
    else parsed = new MoneyAdvanced(value);

    this.input = parsed.input;
    this.value = parsed.value;
    this.places = parsed.places;
    this.isInteger = parsed.isInteger;

    return this;
  }

  discount(
    value: MoneyAdvanced | IMoney | number,
    mode: "percent" | "value" = "percent"
  ): this {
    let percent: MoneyAdvanced;

    if (mode === "value") {
      percent = this.percentage(value);
    } else {
      percent = new MoneyAdvanced(
        typeof value === "number" ? { value: value, places: 15 } : value
      );
    }

    const discountValue = new MoneyAdvanced(this).mul(percent.div(100).float);

    this.sub({ value: discountValue.float });

    return this;
  }

  percentage(value: MoneyAdvanced | IMoney | number): MoneyAdvanced {
    const parsed = this.parseValue(value);

    return new MoneyAdvanced({ value: parsed.float, places: 15 })
      .div(this.float)
      .mul(100);
  }

  abs(): this {
    this.value = Math.abs(this.value);

    return this;
  }

  private parseValue(value: MoneyAdvanced | IMoney | number): MoneyAdvanced {
    let parsed = new MoneyAdvanced(
      typeof value === "number" ? { value: value } : value
    );

    if (parsed.places !== this.places) {
      const factor = Math.pow(10, this.places - parsed.places);
      parsed = new MoneyAdvanced({
        places: this.places,
        isInteger: true,
        value: MoneyAdvanced.roundNumber(parsed.integer * factor),
      });
    }

    return parsed;
  }

  static floatToInteger(value: number, places = 2): number {
    return Number(
      `${value < 0 ? "-" : ""}${value
        .toLocaleString("pt-BR", {
          minimumFractionDigits: places,
          style: "currency",
          currency: "BRL",
        })
        .replace(/\D/g, "")}`
    );
  }

  static integerToFloat(value: number, places = 2): number {
    const str = String(value)
      .replace(/\D/g, "")
      .padStart(places + 1, "0");
    const index = str.length - places;

    return Number(
      `${value < 0 ? "-" : ""}${str.slice(0, index)}.${str.slice(index)}`
    );
  }

  static roundNumber(value: number, decimals = 0): number {
    const factor: number = Math.pow(10, decimals);
    return Math.round(value * factor) / factor;
  }
}

