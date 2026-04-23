/**
 * Value Object: Precio
 * Representa un precio monetario.
 * 
 * Propiedades:
 * - Inmutable: una vez creado, no puede cambiar
 * - Validado: no permite valores negativos o cero
 * - Comparable por valor: dos Precios con el mismo monto son iguales
 */
class Precio {
  constructor(monto) {
    if (typeof monto !== 'number' || monto < 0) {
      throw new Error(`Precio inválido: debe ser un número no negativo, recibió ${monto}`);
    }
    this._monto = parseFloat(monto.toFixed(2)); // Redondear a 2 decimales
    Object.freeze(this); // Inmutabilidad
  }

  /**
   * Obtener el monto del precio
   */
  get monto() {
    return this._monto;
  }

  /**
   * Sumar otro Precio a este
   */
  sumar(otroPrecio) {
    if (!(otroPrecio instanceof Precio)) {
      throw new Error('Solo se puede sumar otro Precio');
    }
    return new Precio(this._monto + otroPrecio._monto);
  }

  /**
   * Multiplicar el Precio por una cantidad
   */
  multiplicar(cantidad) {
    if (typeof cantidad !== 'number' || cantidad < 0) {
      throw new Error('La cantidad debe ser un número no negativo');
    }
    return new Precio(this._monto * cantidad);
  }

  /**
   * Comparar si este Precio es igual a otro
   */
  esIgual(otroPrecio) {
    if (!(otroPrecio instanceof Precio)) {
      return false;
    }
    return this._monto === otroPrecio._monto;
  }

  /**
   * Comparar si este Precio es mayor a otro
   */
  esMayorQue(otroPrecio) {
    if (!(otroPrecio instanceof Precio)) {
      throw new Error('Solo se puede comparar con otro Precio');
    }
    return this._monto > otroPrecio._monto;
  }

  /**
   * Comparar si este Precio es menor a otro
   */
  esMenorQue(otroPrecio) {
    if (!(otroPrecio instanceof Precio)) {
      throw new Error('Solo se puede comparar con otro Precio');
    }
    return this._monto < otroPrecio._monto;
  }

  /**
   * Representación en string
   */
  toString() {
    return `$${this._monto.toFixed(2)}`;
  }
}

module.exports = Precio;
