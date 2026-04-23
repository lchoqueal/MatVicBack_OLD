/**
 * Entity dentro del Aggregate Root Pedido
 * Representa un item dentro de un pedido
 */
const Cantidad = require('../valueObjects/Cantidad');
const Precio = require('../valueObjects/Precio');

class ItemPedido {
  constructor(productoId, nombre, cantidad, precioUnitario, subTotal) {
    if (!productoId) {
      throw new Error('El ID del producto es requerido');
    }
    if (!nombre || nombre.trim() === '') {
      throw new Error('El nombre del producto es requerido');
    }

    this._productoId = productoId;
    this._nombre = nombre;
    this._cantidad = cantidad instanceof Cantidad ? cantidad : new Cantidad(cantidad);
    this._precioUnitario = precioUnitario instanceof Precio ? precioUnitario : new Precio(precioUnitario);
    this._subTotal = subTotal instanceof Precio ? subTotal : new Precio(subTotal);

    // Validar invariante: el subtotal debe ser igual a precio unitario * cantidad
    this._validarInvariante();
  }

  /**
   * Validar que el subtotal sea coherente
   */
  _validarInvariante() {
    const calculado = this._precioUnitario.multiplicar(this._cantidad.valor);
    if (!calculado.esIgual(this._subTotal)) {
      throw new Error(
        `Invariante violado: subTotal (${this._subTotal.monto}) debe ser ` +
        `precioUnitario (${this._precioUnitario.monto}) * cantidad (${this._cantidad.valor})`
      );
    }
  }

  // Getters (solo lectura)
  get productoId() {
    return this._productoId;
  }

  get nombre() {
    return this._nombre;
  }

  get cantidad() {
    return this._cantidad;
  }

  get precioUnitario() {
    return this._precioUnitario;
  }

  get subTotal() {
    return this._subTotal;
  }

  /**
   * Representación del item
   */
  toJSON() {
    return {
      productoId: this._productoId,
      nombre: this._nombre,
      cantidad: this._cantidad.valor,
      precioUnitario: this._precioUnitario.monto,
      subTotal: this._subTotal.monto
    };
  }
}

module.exports = ItemPedido;
