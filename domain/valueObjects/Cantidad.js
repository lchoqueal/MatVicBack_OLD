/**
 * Value Object: Cantidad
 * Representa una cantidad de productos.
 * 
 * Propiedades:
 * - Inmutable: una vez creada, no puede cambiar
 * - Validada: no permite valores <= 0
 * - Comparable por valor: dos Cantidades con el mismo valor son iguales
 */
class Cantidad {
  constructor(valor) {
    if (!Number.isInteger(valor) || valor <= 0) {
      throw new Error(`Cantidad inválida: debe ser un entero positivo, recibió ${valor}`);
    }
    this._valor = valor;
    Object.freeze(this); // Inmutabilidad
  }

  /**
   * Obtener el valor de la cantidad
   */
  get valor() {
    return this._valor;
  }

  /**
   * Sumar otra Cantidad a esta
   */
  sumar(otraCantidad) {
    if (!(otraCantidad instanceof Cantidad)) {
      throw new Error('Solo se puede sumar otra Cantidad');
    }
    return new Cantidad(this._valor + otraCantidad._valor);
  }

  /**
   * Restar otra Cantidad a esta
   */
  restar(otraCantidad) {
    if (!(otraCantidad instanceof Cantidad)) {
      throw new Error('Solo se puede restar otra Cantidad');
    }
    const resultado = this._valor - otraCantidad._valor;
    if (resultado <= 0) {
      throw new Error('La resta resultaría en una cantidad no válida');
    }
    return new Cantidad(resultado);
  }

  /**
   * Comparar si esta Cantidad es igual a otra
   */
  esIgual(otraCantidad) {
    if (!(otraCantidad instanceof Cantidad)) {
      return false;
    }
    return this._valor === otraCantidad._valor;
  }

  /**
   * Comparar si esta Cantidad es mayor a otra
   */
  esMayorQue(otraCantidad) {
    if (!(otraCantidad instanceof Cantidad)) {
      throw new Error('Solo se puede comparar con otra Cantidad');
    }
    return this._valor > otraCantidad._valor;
  }

  /**
   * Comparar si esta Cantidad es menor a otra
   */
  esMenorQue(otraCantidad) {
    if (!(otraCantidad instanceof Cantidad)) {
      throw new Error('Solo se puede comparar con otra Cantidad');
    }
    return this._valor < otraCantidad._valor;
  }

  /**
   * Comparar si esta Cantidad es mayor o igual a otra
   */
  esMayorOIgualQue(otraCantidad) {
    if (!(otraCantidad instanceof Cantidad)) {
      throw new Error('Solo se puede comparar con otra Cantidad');
    }
    return this._valor >= otraCantidad._valor;
  }

  /**
   * Representación en string
   */
  toString() {
    return `${this._valor}`;
  }
}

module.exports = Cantidad;
