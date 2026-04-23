# ADR-001: Refactorización del Dominio hacia Domain-Driven Design

**Fecha:** 23 de Abril de 2026  
**Estado:** Aceptada  
**Decisor:** Equipo de Desarrollo  

---

## Contexto

El sistema MatVic Backend presentaba los siguientes problemas arquitectónicos:

1. **Anemia de Dominio**: Las clases modelo (`User`, `Product`, etc.) contenían solo atributos con getters/setters. Toda la lógica de negocio estaba dispersa en los controladores y servicios.

2. **Falta de Encapsulación de Reglas de Negocio**:
   - El cálculo del total del pedido estaba en el controlador (`orderController.js`)
   - Validaciones de stock, métodos de pago y estados se hacían manualmente sin protección
   - Ningún lugar garantizaba la integridad de los datos

3. **Tipos Primitivos sin Semántica**:
   - Precios se representaban como números simples (sin validación)
   - Cantidades eran enteros sin restricciones
   - Emails eran strings sin validación
   - Esto permitía crear estados inválidos (ej. precio negativo, cantidad = 0)

4. **Inconsistencia de Datos**:
   - No había garantía de que el total de un pedido fuera coherente con sus items
   - Los cambios de estado del pedido podían ocurrir sin validación
   - No existía un punto único de verdad para las reglas de negocio

---

## Decisión

Implementamos los principios de **Domain-Driven Design** mediante:

### 1. Value Objects (Objetos de Valor)

Creamos los siguientes Value Objects para reemplazar primitivos:

#### `Precio` (domain/valueObjects/Precio.js)
- **Propósito**: Encapsular un valor monetario con validación
- **Propiedades**:
  -  Inmutable: no cambia después de crearse
  -  Validado: rechaza valores negativos
  -  Comparable por valor: dos Precios con igual monto son idénticos
- **Métodos**:
  - `sumar(otroPrecio)`: suma dos precios
  - `multiplicar(cantidad)`: multiplica por una cantidad
  - `esIgual()`, `esMayorQue()`, `esMenorQue()`: comparaciones

#### `Cantidad` (domain/valueObjects/Cantidad.js)
- **Propósito**: Encapsular una cantidad de productos
- **Propiedades**:
  -  Inmutable
  -  Validada: solo acepta enteros positivos (> 0)
  -  Comparable por valor
- **Métodos**:
  - `sumar()`, `restar()`: operaciones aritméticas
  - Comparadores: `esIgual()`, `esMayorQue()`, `esMenorOIgualQue()`, etc.

#### `Email` (domain/valueObjects/Email.js)
- **Propósito**: Validar y encapsular direcciones de correo
- **Propiedades**:
  -  Inmutable
  -  Validada: verifica formato de email con regex
  -  Comparable por valor
- **Métodos**:
  - `esIgual()`: compara direcciones

### 2. Aggregate Root (Raíz de Agregado)

#### `Pedido` (domain/aggregates/Pedido.js)
- **Propósito**: Ser la raíz del agregado que encapsula toda la lógica de un pedido

**Invariantes (Reglas que SIEMPRE se cumplen):**
1. Un pedido DEBE tener al menos un item
2. El total DEBE ser la suma exacta de los subtotales de sus items
3. Un pedido DEBE tener un método de pago válido
4. El estado solo puede cambiar mediante transiciones específicas

**Estados permitidos:**
- `pendiente` → `confirmado` → `enviado` → `entregado`
- Desde cualquier estado previo: → `cancelado`

**Métodos de Negocio (Comandos):**
- `confirmar()`: transiciona a CONFIRMADO
- `marcarComoEnviado()`: transiciona a ENVIADO
- `marcarComoEntregado()`: transiciona a ENTREGADO
- `cancelar(razon)`: transiciona a CANCELADO
- `agregarNota(nota)`: agrega notas al pedido

**Queries:**
- `obtenerCantidadTotalItems()`: suma de todas las cantidades
- `obtenerCantidadProductosDiferentes()`: número de items únicos
- `contieneProducto(productoId)`: verifica presencia
- `estaBloqueado()`: si está en estado final (ENTREGADO o CANCELADO)

### 3. Entity (Entidad dentro del Agregado)

#### `ItemPedido` (domain/aggregates/ItemPedido.js)
- Entity que representa cada línea del pedido
- Valida que `subTotal === precioUnitario × cantidad`
- No tiene identidad global, solo es válida dentro de un Pedido

---

## Justificación

Estos cambios aseguran:

###  Protección de Invariantes
Según "Implementing Domain-Driven Design" (Vernon, 2013), un agregado debe proteger sus invariantes. Ahora:
- `new Precio(-100)` **lanza error** (antes: se aceptaba)
- `new Cantidad(0)` **lanza error** (antes: se aceptaba)
- `pedido.confirmar()` desde estado CANCELADO **lanza error** (antes: se hacía sin validar)

###  Coherencia de Datos
El invariante del total es verificado en cada construcción:
```javascript
new Pedido(id, clienteId, empleadoId, items, ...);
// Si los items no suman el total esperado → Error
```

###  Lenguaje Ubicuo (Ubiquitous Language)
Los nombres reflejan el dominio, no implementación técnica:
- `confirmar()` en vez de `setEstado('confirmado')`
- `agregarNota()` en vez de `actualizarNota()`
- `Precio` en vez de `double`

###  Facilita Evolución
Si mañana cambia la regla de cálculo de precios (ej. aplicar impuestos), solo cambiamos `Precio`. Todos los lugares que usan `Precio` automáticamente adoptan el nuevo comportamiento.

###  Testabilidad
Es mucho más fácil hacer unit tests:
```javascript
const precio = new Precio(100);
const cantidad = new Cantidad(3);
expect(precio.multiplicar(cantidad.valor).monto).toBe(300);
```

---

## Alternativas Consideradas

###  Mantener la arquitectura actual (Anémica)
- **Problema**: Continuar con reglas de negocio dispersas en controladores
- **Riesgo**: Inconsistencias de datos y bugs difíciles de rastrear

###  Usar solo value objects sin agregados
- **Problema**: No habría punto único de verdad para reglas como "estado del pedido"
- **Riesgo**: Múltiples formas de crear un pedido válido/inválido

###  Usar Agregados muy grandes (todo en Pedido)
- **Problema**: Causaría contentiones en concurrencia
- **Riesgo**: Bloqueos de base de datos al actualizar

---

## Consecuencias

### Positivas 
1. **Código más mantenible**: Lógica centralizada en el dominio
2. **Menos bugs**: Validaciones tempranas y constantes
3. **Más testeable**: Fácil crear casos de prueba
4. **Escalable**: Estructura clara para nuevas reglas

### Negativas 
1. **Inicialmente más código**: Más clases, pero cada una con responsabilidad clara
2. **Curva de aprendizaje**: El equipo necesita entender DDD
3. **Migración**: El código existente que usa modelos debe adaptarse

---

## Referencias

- Vernon, V. (2013). *Implementing Domain-Driven Design*. Addison-Wesley.
- Evans, E. (2003). *Domain-Driven Design: Tackling Complexity in the Heart of Software*. Addison-Wesley.
- [DDD Community](https://www.domainlanguage.com/ddd/)

---

**Aprobado por:** [Tu nombre]  
**Fecha de aprobación:** 23 de Abril de 2026
