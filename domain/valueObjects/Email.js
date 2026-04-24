/**
 * Value Object: Email
 * Representa una dirección de correo electrónico.
 * 
 * Propiedades:
 * - Inmutable: una vez creado, no puede cambiar
 * - Validado: valida el formato de email
 * - Comparable por valor: dos Emails con la misma dirección son iguales
 */
class Email {
  // Expresión regular para validar email
  static PATRON_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  constructor(direccion) {
    if (typeof direccion !== 'string' || !Email.PATRON_EMAIL.test(direccion)) {
      throw new Error(`Email inválido: "${direccion}" no cumple el formato requerido`);
    }
    this._direccion = direccion.toLowerCase();
    Object.freeze(this); // Inmutabilidad
  }

  /**
   * Obtener la dirección del email
   */
  get direccion() {
    return this._direccion;
  }

  /**
   * Comparar si este Email es igual a otro
   */
  esIgual(otroEmail) {
    if (!(otroEmail instanceof Email)) {
      return false;
    }
    return this._direccion === otroEmail._direccion;
  }

  /**
   * Representación en string
   */
  toString() {
    return this._direccion;
  }
}

module.exports = Email;
