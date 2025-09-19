export interface IMoney {
  value: number;
  places?: number;
  isInteger?: boolean;
}

export class Money {
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

      this.value = Money.floatToInteger(this.input, this.places);
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
    return Money.integerToFloat(this.value, this.places);
  }

  get floatWithPlaces(): string {
    return this.float.toFixed(this.places);
  }

  get formatted(): string {
    const numbers = this.float.toFixed(2).replace(/\./, ",");

    return `R$ ${numbers}`;
  }

  add(value: Money | IMoney | number): this {
    this.value += this.parseValue(value).integer;

    this.value = Money.roundNumber(this.value);

    return this;
  }

  sub(value: Money | IMoney): this {
    this.value -= this.parseValue(value).integer;

    this.value = Money.roundNumber(this.value);

    return this;
  }

  mul(value: number): this {
    this.value *= value;

    this.value = Money.roundNumber(this.value);

    return this;
  }

  div(value: number): this {
    this.value /= value;

    this.value = Money.roundNumber(this.value);

    return this;
  }

  set(value: Money | IMoney): this {
    let parsed: Money;
    if (value instanceof Money) parsed = value;
    else parsed = new Money(value);

    this.input = parsed.input;
    this.value = parsed.value;
    this.places = parsed.places;
    this.isInteger = parsed.isInteger;

    return this;
  }

  discount(
    value: Money | IMoney | number,
    mode: "percent" | "value" = "percent"
  ): this {
    let percent: Money;

    if (mode === "value") {
      percent = this.percentage(value);
    } else {
      percent = new Money(
        typeof value === "number" ? { value: value, places: 15 } : value
      );
    }

    const discountValue = new Money(this).mul(percent.div(100).float);

    this.sub({ value: discountValue.float });

    return this;
  }

  percentage(value: Money | IMoney | number): Money {
    const parsed = this.parseValue(value);

    return new Money({ value: parsed.float, places: 15 })
      .div(this.float)
      .mul(100);
  }

  abs(): this {
    this.value = Math.abs(this.value);

    return this;
  }

  private parseValue(value: Money | IMoney | number): Money {
    let parsed = new Money(
      typeof value === "number" ? { value: value } : value
    );

    if (parsed.places !== this.places) {
      const factor = Math.pow(10, this.places - parsed.places);
      parsed = new Money({
        places: this.places,
        isInteger: true,
        value: Money.roundNumber(parsed.integer * factor),
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
