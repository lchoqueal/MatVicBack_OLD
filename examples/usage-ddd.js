/**
 * Ejemplo de Uso: Value Objects y Aggregate Root Pedido
 * Este archivo muestra cómo usar los nuevos componentes Domain-Driven Design
 */

const Precio = require('../domain/valueObjects/Precio');
const Cantidad = require('../domain/valueObjects/Cantidad');
const Email = require('../domain/valueObjects/Email');
const Pedido = require('../domain/aggregates/Pedido');
const ItemPedido = require('../domain/aggregates/ItemPedido');

console.log('=== EJEMPLOS DE VALUE OBJECTS ===\n');

// ============= PRECIO =============
console.log('1. VALUE OBJECT: Precio');
try {
  const precioValido = new Precio(99.99);
  console.log(`✅ Precio válido: ${precioValido.toString()}`);
  
  // Las siguientes líneas lanzarían error:
  // new Precio(-100);  // ❌ Error: precio negativo
  // new Precio('abc'); // ❌ Error: no es número
  
  const precio1 = new Precio(50);
  const precio2 = new Precio(30);
  const sumado = precio1.sumar(precio2);
  console.log(`   50 + 30 = ${sumado.toString()}`);
  
  const multiplicado = precio1.multiplicar(3);
  console.log(`   50 * 3 = ${multiplicado.toString()}`);
  
  console.log(`   50 > 30: ${precio1.esMayorQue(precio2)}`);
} catch (err) {
  console.log(`❌ Error: ${err.message}`);
}

// ============= CANTIDAD =============
console.log('\n2. VALUE OBJECT: Cantidad');
try {
  const cantidadValida = new Cantidad(5);
  console.log(`✅ Cantidad válida: ${cantidadValida.toString()} unidades`);
  
  // Las siguientes líneas lanzarían error:
  // new Cantidad(0);     // ❌ Error: cantidad 0 no válida
  // new Cantidad(-5);    // ❌ Error: cantidad negativa
  // new Cantidad(3.5);   // ❌ Error: debe ser entero
  
  const cant1 = new Cantidad(10);
  const cant2 = new Cantidad(3);
  console.log(`   10 - 3 = ${cant1.restar(cant2).toString()}`);
  console.log(`   10 >= 3: ${cant1.esMayorOIgualQue(cant2)}`);
} catch (err) {
  console.log(`❌ Error: ${err.message}`);
}

// ============= EMAIL =============
console.log('\n3. VALUE OBJECT: Email');
try {
  const emailValido = new Email('cliente@matvic.com');
  console.log(`✅ Email válido: ${emailValido.toString()}`);
  
  // Las siguientes líneas lanzarían error:
  // new Email('invalido');         // ❌ Error: sin @
  // new Email('sin.dominio@');     // ❌ Error: sin extensión
  
  const email1 = new Email('USER@matvic.com');
  const email2 = new Email('user@matvic.com');
  console.log(`   Email 1 = Email 2 (case-insensitive): ${email1.esIgual(email2)}`);
} catch (err) {
  console.log(`❌ Error: ${err.message}`);
}

// ============= AGGREGATE ROOT: PEDIDO =============
console.log('\n=== AGGREGATE ROOT: Pedido ===\n');

try {
  console.log('4. Creando un PEDIDO válido...');
  
  // Crear items del pedido
  const item1 = new ItemPedido(
    1,                           // productoId
    'Laptop HP',                 // nombre
    new Cantidad(2),             // cantidad
    new Precio(800),             // precioUnitario
    new Precio(1600)             // subTotal (800 * 2)
  );
  
  const item2 = new ItemPedido(
    2,
    'Mouse Logitech',
    new Cantidad(1),
    new Precio(25),
    new Precio(25)
  );
  
  // Crear el pedido
  const pedido = new Pedido(
    'PED-001',                   // id
    'CLIENT-123',                // clienteId
    'EMP-456',                   // empleadoId
    [item1, item2],              // items
    Pedido.METODOS_PAGO.TARJETA, // metodoPago
    {                            // informacionEnvio
      direccion: 'Calle Principal 123',
      ciudad: 'Lima',
      codigoPostal: '15001'
    },
    Pedido.ESTADOS.PENDIENTE,    // estado
    'Entregar a nombre de Juan'  // notas
  );
  
  console.log(`✅ Pedido creado exitosamente:`);
  console.log(`   ID: ${pedido.id}`);
  console.log(`   Total: ${pedido.total.toString()}`);
  console.log(`   Items: ${pedido.obtenerCantidadTotalItems()} unidades`);
  console.log(`   Productos diferentes: ${pedido.obtenerCantidadProductosDiferentes()}`);
  console.log(`   Estado: ${pedido.estado}`);
  
  console.log('\n5. Transitando estados del pedido...');
  console.log(`   Estado actual: ${pedido.estado}`);
  
  pedido.confirmar();
  console.log(`   ✅ Confirmado: ${pedido.estado}`);
  
  pedido.marcarComoEnviado();
  console.log(`   ✅ Enviado: ${pedido.estado}`);
  
  pedido.marcarComoEntregado();
  console.log(`   ✅ Entregado: ${pedido.estado}`);
  
  // Intento fallido: no se puede cancelar un pedido entregado
  console.log('\n6. Intento de cancelar pedido entregado (debe fallar)...');
  try {
    pedido.cancelar('Cliente cambió de idea');
  } catch (err) {
    console.log(`   ❌ Error esperado: ${err.message}`);
  }
  
  console.log('\n7. Ejemplo de invariante violado (debe fallar)...');
  try {
    // El subTotal (1500) NO es igual a precioUnitario (800) * cantidad (2)
    const itemInvalido = new ItemPedido(1, 'Producto', new Cantidad(2), new Precio(800), new Precio(1500));
  } catch (err) {
    console.log(`   ❌ Error esperado: ${err.message}`);
  }
  
  console.log('\n8. Serialización del pedido para respuesta API...');
  console.log(JSON.stringify(pedido.toJSON(), null, 2));
  
} catch (err) {
  console.log(`❌ Error: ${err.message}`);
}

console.log('\n=== VENTAJAS DE ESTA ARQUITECTURA ===');
console.log('✅ Los Value Objects garantizan validez: imposible crear Precio(-100)');
console.log('✅ El Agregado Pedido protege sus invariantes: total = suma de items');
console.log('✅ Estados tranicionan solo de formas válidas: pendiente → confirmado → enviado');
console.log('✅ Código más legible: confirmar() en lugar de setEstado("confirmado")');
console.log('✅ Fácil de testear: crear casos de prueba es directo y claro');
console.log('✅ Menos bugs: reglas de negocio implementadas centralizadamente');
