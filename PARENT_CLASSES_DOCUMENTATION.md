# 📚 ParentClasses - Página de Clases y Planes para Padres

## 🎯 Descripción
La página **ParentClasses** permite a los padres ver toda la información relacionada con las clases y planes de entrenamiento de sus hijos en la academia de vóleibol.

## ✨ Funcionalidades Implementadas

### 🏠 **Header Principal**
- Foto del estudiante con badge de identificación
- Nombre, categoría y edad del estudiante
- Estadísticas rápidas: entrenador asignado, porcentaje de asistencia, clases próximas
- Botón de exportar horarios

### 📑 **Sistema de Tabs**
La página está organizada en 4 pestañas principales:

#### 1. 📅 **Próximas Clases**
- **Navegación de semanas** con botones anterior/siguiente
- **Filtros por tipo** de entrenamiento (Técnico, Físico, Táctico)
- **Lista de clases** con información detallada:
  - Fecha y horario
  - Tipo de entrenamiento con color distintivo
  - Entrenador asignado
  - Ubicación/cancha
  - Estado de asistencia (Programada, Asistió, Faltó)
- **Modal detallado** al hacer clic en una clase

#### 2. 🎯 **Planes de Entrenamiento**
- **Lista de planes** asignados por entrenadores
- **Información de cada plan**:
  - Título y descripción
  - Nivel de dificultad (badge colorizado)
  - Duración, entrenador y número de ejercicios
  - Fecha de creación
- **Modal detallado** con:
  - Objetivos específicos
  - Lista completa de ejercicios
  - Métricas del plan
  - Equipamiento necesario

#### 3. 📊 **Historial de Asistencia**
- **Cards de estadísticas**:
  - Total de clases
  - Asistencias
  - Faltas
  - Porcentaje de asistencia
- **Historial chronológico** con:
  - Fecha de cada clase
  - Estado (Presente/Ausente)
  - Notas del entrenador
  - Información del entrenador y ubicación

#### 4. ⏰ **Horarios Regulares**
- **Información de la categoría**:
  - Descripción de la categoría
  - Rango de edad
  - Número de estudiantes actual/máximo
  - Mensualidad
  - Entrenador principal
- **Horarios semanales** fijos:
  - Día de la semana
  - Horario de inicio y fin
  - Ubicación
  - Entrenador asignado

## 🛠 **Implementación Técnica**

### **Datos Utilizados**
- `students` - Información del estudiante
- `schedules` - Horarios programados
- `trainingPlans` - Planes de entrenamiento
- `attendances` - Historial de asistencia
- `coaches` - Información de entrenadores
- `categories` - Categorías de estudiantes

### **Estados de la Página**
- `selectedTab` - Pestaña activa
- `selectedWeek` - Semana seleccionada (0 = actual)
- `filterType` - Filtro de tipo de entrenamiento
- `showClassModal` / `showPlanModal` - Modales de detalles

### **Lógica de Negocio**
- **Generación de clases futuras** basada en horarios recurrentes
- **Cálculo de estadísticas** de asistencia
- **Filtrado inteligente** por período y tipo
- **Navegación temporal** por semanas

## 🎨 **Diseño y UX**

### **Responsive Design**
- Adaptable a móvil y desktop
- Grid responsive para cards
- Navegación optimizada para touch

### **Animaciones**
- Framer Motion para transiciones suaves
- Efectos hover en cards
- Loading states y staggered animations

### **Colores y Estados**
- **Técnico**: Azul (`bg-blue-500`)
- **Físico**: Verde (`bg-green-500`)  
- **Táctico**: Púrpura (`bg-purple-500`)
- **Presente**: Verde claro
- **Ausente**: Rojo claro
- **Programada**: Azul claro

### **Iconografía**
- Iconos consistentes de `react-icons/fi`
- Badges informativos para estados
- Indicadores visuales claros

## 📍 **Integración**

### **Rutas Agregadas**
```tsx
// AppRouter.tsx
<Route path="/parent/classes" element={<ParentClasses />} />
```

### **Navegación**
```tsx
// Sidebar.tsx
{ icon: FiBook, label: 'Clases y Planes', path: '/parent/classes' }
```

### **Datos de Ejemplo**
Se agregaron datos completos en `mockData.ts`:
- 9 horarios de ejemplo para todas las categorías
- 3 planes de entrenamiento detallados
- 18 registros de asistencia para diferentes estudiantes

## 🔮 **Funcionalidades Futuras**
- Exportación real de horarios en PDF
- Notificaciones push para próximas clases
- Sincronización con calendario del dispositivo
- Chat directo con entrenadores
- Evaluación de satisfacción post-clase

## 🚀 **Uso**
1. Inicia sesión como padre
2. Navega a "Clases y Planes" en el sidebar
3. Explora las diferentes pestañas
4. Haz clic en clases o planes para ver detalles
5. Usa los filtros para encontrar información específica

La página está completamente funcional y proporciona a los padres una vista integral de toda la actividad educativa de sus hijos en la academia.