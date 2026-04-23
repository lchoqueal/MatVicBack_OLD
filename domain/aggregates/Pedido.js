/**
 * Aggregate Root: Pedido
 * 
 * Encapsula la lógica de negocio de un pedido.
 * 
 * Invariantes (reglas que SIEMPRE se deben cumplir):
 * 1. Un pedido debe tener al menos un item
 * 2. El total del pedido debe ser la suma de los subtotales de sus items
 * 3. Un pedido debe tener un método de pago
 * 4. El estado del pedido solo puede cambiar de formas específicas
 */

const ItemPedido = require('./ItemPedido');
const Precio = require('../valueObjects/Precio');

class Pedido {
  // Estados válidos del pedido
  static ESTADOS = {
    PENDIENTE: 'pendiente',
    CONFIRMADO: 'confirmado',
    ENVIADO: 'enviado',
    ENTREGADO: 'entregado',
    CANCELADO: 'cancelado'
  };

  // Métodos de pago válidos
  static METODOS_PAGO = {
    TARJETA: 'tarjeta',
    TRANSFERENCIA: 'transferencia',
    EFECTIVO: 'efectivo',
    BILLETERA_DIGITAL: 'billetera_digital'
  };

  constructor(id, clienteId, empleadoId, items, metodoPago, informacionEnvio, estado = Pedido.ESTADOS.PENDIENTE, notas = '') {
    if (!id) {
      throw new Error('El ID del pedido es requerido');
    }
    if (!clienteId) {
      throw new Error('El ID del cliente es requerido');
    }
    if (!empleadoId) {
      throw new Error('El ID del empleado es requerido');
    }
    if (!Array.isArray(items) || items.length === 0) {
      throw new Error('Un pedido debe tener al menos un item');
    }
    if (!metodoPago || !Object.values(Pedido.METODOS_PAGO).includes(metodoPago)) {
      throw new Error(`Método de pago inválido: ${metodoPago}`);
    }
    if (!informacionEnvio || !informacionEnvio.direccion) {
      throw new Error('La información de envío con dirección es requerida');
    }

    this._id = id;
    this._clienteId = clienteId;
    this._empleadoId = empleadoId;
    this._items = items.map(item => 
      item instanceof ItemPedido ? item : new ItemPedido(
        item.productoId, 
        item.nombre, 
        item.cantidad, 
        item.precioUnitario, 
        item.subTotal
      )
    );
    this._metodoPago = metodoPago;
    this._informacionEnvio = informacionEnvio;
    this._estado = estado;
    this._notas = notas;
    this._fechaCreacion = new Date();
    this._total = this._calcularTotal();

    // Validar que los invariantes se cumplen
    this._validarInvariantes();
  }

  /**
   * Calcular el total del pedido sumando los subtotales de todos los items
   * Este método encapsula la regla: "el total es la suma de los subtotales"
   */
  _calcularTotal() {
    let total = new Precio(0);
    for (const item of this._items) {
      total = total.sumar(item.subTotal);
    }
    return total;
  }

  /**
   * Validar que todos los invariantes se cumplen
   */
  _validarInvariantes() {
    // Invariante 1: Al menos un item
    if (this._items.length === 0) {
      throw new Error('Un pedido debe tener al menos un item');
    }

    // Invariante 2: El total debe ser coherente
    const totalCalculado = this._calcularTotal();
    if (!totalCalculado.esIgual(this._total)) {
      throw new Error(
        `Invariante violado: el total del pedido debe ser la suma de los subtotales. ` +
        `Esperado: ${totalCalculado.monto}, Obtenido: ${this._total.monto}`
      );
    }

    // Invariante 3: Estado válido
    if (!Object.values(Pedido.ESTADOS).includes(this._estado)) {
      throw new Error(`Estado inválido del pedido: ${this._estado}`);
    }
  }

  // ========== GETTERS ==========
  get id() {
    return this._id;
  }

  get clienteId() {
    return this._clienteId;
  }

  get empleadoId() {
    return this._empleadoId;
  }

  get items() {
    return [...this._items]; // Retornar copia para evitar mutación externa
  }

  get metodoPago() {
    return this._metodoPago;
  }

  get informacionEnvio() {
    return { ...this._informacionEnvio }; // Retornar copia
  }

  get estado() {
    return this._estado;
  }

  get notas() {
    return this._notas;
  }

  get total() {
    return this._total;
  }

  get fechaCreacion() {
    return this._fechaCreacion;
  }

  // ========== COMANDOS (Métodos de negocio) ==========

  /**
   * Confirmar el pedido
   * Solo se puede confirmar si está en estado PENDIENTE
   */
  confirmar() {
    if (this._estado !== Pedido.ESTADOS.PENDIENTE) {
      throw new Error(`No se puede confirmar un pedido en estado ${this._estado}`);
    }
    this._estado = Pedido.ESTADOS.CONFIRMADO;
  }

  /**
   * Marcar pedido como enviado
   * Solo se puede enviar si está confirmado
   */
  marcarComoEnviado() {
    if (this._estado !== Pedido.ESTADOS.CONFIRMADO) {
      throw new Error(`No se puede enviar un pedido en estado ${this._estado}`);
    }
    this._estado = Pedido.ESTADOS.ENVIADO;
  }

  /**
   * Marcar pedido como entregado
   * Solo se puede entregar si está enviado
   */
  marcarComoEntregado() {
    if (this._estado !== Pedido.ESTADOS.ENVIADO) {
      throw new Error(`No se puede entregar un pedido en estado ${this._estado}`);
    }
    this._estado = Pedido.ESTADOS.ENTREGADO;
  }

  /**
   * Cancelar el pedido
   * Solo se puede cancelar si está en estado PENDIENTE o CONFIRMADO
   */
  cancelar(razon = '') {
    if (![Pedido.ESTADOS.PENDIENTE, Pedido.ESTADOS.CONFIRMADO].includes(this._estado)) {
      throw new Error(`No se puede cancelar un pedido en estado ${this._estado}`);
    }
    this._estado = Pedido.ESTADOS.CANCELADO;
    if (razon) {
      this._notas += ` [CANCELACIÓN: ${razon}]`;
    }
  }

  /**
   * Agregar una nota al pedido
   */
  agregarNota(nota) {
    if (!nota || nota.trim() === '') {
      throw new Error('La nota no puede estar vacía');
    }
    this._notas += `\n${nota}`;
  }

  /**
   * Verificar si el pedido está completado
   */
  estaBloqueado() {
    return [Pedido.ESTADOS.ENTREGADO, Pedido.ESTADOS.CANCELADO].includes(this._estado);
  }

  // ========== QUERIES ==========

  /**
   * Obtener cantidad total de items en el pedido
   */
  obtenerCantidadTotalItems() {
    let total = 0;
    for (const item of this._items) {
      total += item.cantidad.valor;
    }
    return total;
  }

  /**
   * Obtener cantidad de productos diferentes
   */
  obtenerCantidadProductosDiferentes() {
    return this._items.length;
  }

  /**
   * Verificar si el pedido contiene un producto específico
   */
  contieneProducto(productoId) {
    return this._items.some(item => item.productoId === productoId);
  }

  /**
   * Obtener un item específico por producto ID
   */
  obtenerItem(productoId) {
    return this._items.find(item => item.productoId === productoId) || null;
  }

  // ========== SERIALIZACIÓN ==========

  /**
   * Convertir a objeto JSON para persistencia o respuesta API
   */
  toJSON() {
    return {
      id: this._id,
      clienteId: this._clienteId,
      empleadoId: this._empleadoId,
      items: this._items.map(item => item.toJSON()),
      metodoPago: this._metodoPago,
      informacionEnvio: this._informacionEnvio,
      estado: this._estado,
      notas: this._notas,
      fechaCreacion: this._fechaCreacion,
      total: this._total.monto,
      cantidadItems: this.obtenerCantidadTotalItems(),
      cantidadProductosDiferentes: this.obtenerCantidadProductosDiferentes()
    };
  }

  /**
   * Crear una instancia de Pedido desde datos de base de datos
   */
  static crearDesdeDB(datosBD) {
    // Esta es la forma de reconstruir un agregado desde la BD
    return new Pedido(
      datosBD.id,
      datosBD.clienteId,
      datosBD.empleadoId,
      datosBD.items,
      datosBD.metodoPago,
      datosBD.informacionEnvio,
      datosBD.estado || Pedido.ESTADOS.PENDIENTE,
      datosBD.notas || ''
    );
  }
}

module.exports = Pedido;
