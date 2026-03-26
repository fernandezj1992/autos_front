<template>
  <div class="reparaciones-list">
    <div class="page-header">
      <router-link to="/" class="back-link">
        <span class="material-symbols-rounded">arrow_back</span>
        Volver a Mis Autos
      </router-link>
    </div>

    <div v-if="auto" class="auto-hero">
      <div class="hero-left">
        <span class="material-symbols-rounded hero-icon">directions_car</span>
        <div>
          <h2>{{ auto.marca }} {{ auto.modelo }}</h2>
          <div class="hero-badges">
            <span class="badge">
              <span class="material-symbols-rounded">confirmation_number</span>
              {{ auto.placas }}
            </span>
            <span class="badge">
              <span class="material-symbols-rounded">speed</span>
              {{ auto.kilometraje?.toLocaleString() }} km
            </span>
            <span class="badge">
              <span class="material-symbols-rounded">calendar_today</span>
              {{ auto.anio }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <div class="section-header">
      <div class="section-title">
        <span class="material-symbols-rounded section-icon">build_circle</span>
        <div>
          <h1>Historial de Reparaciones</h1>
          <p class="subtitle">
            <template v-if="filtroCategoria">
              {{ reparacionesFiltradas.length }} de {{ reparaciones.length }} registro{{ reparaciones.length !== 1 ? 's' : '' }}
            </template>
            <template v-else>
              {{ reparaciones.length }} registro{{ reparaciones.length !== 1 ? 's' : '' }}
            </template>
          </p>
        </div>
      </div>
      <router-link :to="`/autos/${autoId}/reparaciones/agregar`" class="btn btn-primary">
        <span class="material-symbols-rounded">add</span>
        Nueva Reparación
      </router-link>
    </div>

    <div v-if="!loading && reparaciones.length > 0" class="filter-bar">
      <div class="filter-chips">
        <span class="material-symbols-rounded filter-icon">filter_list</span>
        <button
          :class="['filter-chip', { active: filtroCategoria === '' }]"
          @click="filtroCategoria = ''"
        >Todas</button>
        <button
          v-for="(label, key) in categoriaLabels"
          :key="key"
          :class="['filter-chip', { active: filtroCategoria === key }]"
          :style="filtroCategoria === key ? { background: categoriaStyles[key]?.bg, color: categoriaStyles[key]?.color, borderColor: categoriaStyles[key]?.color } : {}"
          @click="filtroCategoria = key"
        >{{ label }}</button>
      </div>
      <div class="sort-wrapper">
        <span class="material-symbols-rounded sort-icon">sort</span>
        <select v-model="ordenarRep" class="sort-select">
          <option v-for="op in ordenOpciones" :key="op.value" :value="op.value">{{ op.label }}</option>
        </select>
      </div>
    </div>

    <div v-if="loading" class="loading-state">
      <span class="material-symbols-rounded spin">progress_activity</span>
      <p>Cargando reparaciones...</p>
    </div>

    <div v-else-if="reparaciones.length === 0" class="empty-state">
      <span class="material-symbols-rounded empty-icon">build</span>
      <h3>Sin reparaciones</h3>
      <p>Este vehículo no tiene reparaciones registradas</p>
      <router-link :to="`/autos/${autoId}/reparaciones/agregar`" class="btn btn-primary">
        <span class="material-symbols-rounded">add</span>
        Agregar Reparación
      </router-link>
    </div>

    <div v-else-if="reparacionesFiltradas.length === 0 && filtroCategoria" class="empty-state">
      <span class="material-symbols-rounded empty-icon">filter_list_off</span>
      <h3>Sin resultados</h3>
      <p>No hay reparaciones en la categoría seleccionada</p>
      <button @click="filtroCategoria = ''" class="btn btn-primary">
        <span class="material-symbols-rounded">clear_all</span>
        Mostrar Todas
      </button>
    </div>

    <div v-else class="repairs-list">
      <div v-for="rep in reparacionesFiltradas" :key="rep.id" class="repair-card">
        <div class="repair-left">
          <span class="material-symbols-rounded repair-icon">handyman</span>
          <div class="repair-info">
            <h4>{{ rep.descripcion }}</h4>
            <span v-if="rep.categoria" class="category-badge"
                  :style="{ background: categoriaStyles[rep.categoria]?.bg, color: categoriaStyles[rep.categoria]?.color }">
              <span class="material-symbols-rounded">{{ categoriaStyles[rep.categoria]?.icon }}</span>
              {{ categoriaLabels[rep.categoria] || rep.categoria }}
            </span>
            <div class="repair-meta">
              <span class="meta-item">
                <span class="material-symbols-rounded">speed</span>
                {{ rep.kilometraje?.toLocaleString() }} km
              </span>
              <span class="meta-item">
                <span class="material-symbols-rounded">event</span>
                {{ formatDate(rep.fecha) }}
              </span>
            </div>
          </div>
        </div>
        <div class="repair-right">
          <span class="repair-cost">S/{{ formatCurrency(rep.costo) }}</span>
          <button @click="eliminar(rep.id)" class="btn-icon-delete" title="Eliminar reparación">
            <span class="material-symbols-rounded">delete</span>
          </button>
        </div>
      </div>

      <div class="total-card">
        <span class="material-symbols-rounded total-icon">payments</span>
        <span class="total-label">Costo Total</span>
        <span class="total-value">S/{{ formatCurrency(totalCosto) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import api from '../api/axios.js'

const route = useRoute()
const autoId = route.params.id

const auto = ref(null)
const reparaciones = ref([])
const loading = ref(true)
const filtroCategoria = ref('')
const ordenarRep = ref('fecha_desc')

const categoriaLabels = {
  MECANICA: 'Mecánica',
  ELECTRICA: 'Eléctrica',
  CARROCERIA: 'Carrocería',
  LLANTAS: 'Llantas',
  SERVICIO_PREVENTIVO: 'Servicio Preventivo',
  OTRO: 'Otro'
}

const categoriaStyles = {
  MECANICA: { bg: '#fef3c7', color: '#92400e', icon: 'build' },
  ELECTRICA: { bg: '#dbeafe', color: '#1e40af', icon: 'bolt' },
  CARROCERIA: { bg: '#fce7f3', color: '#9d174d', icon: 'directions_car' },
  LLANTAS: { bg: '#e0e7ff', color: '#3730a3', icon: 'trip_origin' },
  SERVICIO_PREVENTIVO: { bg: '#d1fae5', color: '#065f46', icon: 'verified' },
  OTRO: { bg: '#f1f5f9', color: '#475569', icon: 'more_horiz' }
}

const ordenOpciones = [
  { value: 'fecha_desc', label: 'Fecha (reciente)' },
  { value: 'fecha_asc', label: 'Fecha (antigua)' },
  { value: 'costo_desc', label: 'Costo (mayor)' },
  { value: 'costo_asc', label: 'Costo (menor)' }
]

const reparacionesFiltradas = computed(() => {
  let lista = reparaciones.value
  if (filtroCategoria.value) {
    lista = lista.filter(r => r.categoria === filtroCategoria.value)
  }
  const sorted = [...lista]
  switch (ordenarRep.value) {
    case 'fecha_desc': sorted.sort((a, b) => (b.fecha || '').localeCompare(a.fecha || '')); break
    case 'fecha_asc': sorted.sort((a, b) => (a.fecha || '').localeCompare(b.fecha || '')); break
    case 'costo_desc': sorted.sort((a, b) => (b.costo || 0) - (a.costo || 0)); break
    case 'costo_asc': sorted.sort((a, b) => (a.costo || 0) - (b.costo || 0)); break
  }
  return sorted
})

const totalCosto = computed(() => reparacionesFiltradas.value.reduce((sum, r) => sum + (r.costo || 0), 0))

const formatCurrency = (value) => {
  if (value == null) return '0.00'
  return Number(value).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const formatDate = (date) => {
  if (!date) return '---'
  return new Date(date + 'T00:00:00').toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
}

const fetchData = async () => {
  try {
    const [autoRes, repRes] = await Promise.all([
      api.get(`/autos/${autoId}`),
      api.get(`/autos/${autoId}/reparaciones`)
    ])
    auto.value = autoRes.data
    reparaciones.value = repRes.data
  } catch (error) {
    auto.value = null
    reparaciones.value = []
  } finally {
    loading.value = false
  }
}

const eliminar = async (repId) => {
  if (!confirm('¿Estás seguro de que deseas eliminar esta reparación?')) return
  try {
    await api.delete(`/autos/${autoId}/reparaciones/${repId}`)
    reparaciones.value = reparaciones.value.filter(r => r.id !== repId)
  } catch (error) {
    alert('Error al eliminar la reparación.')
  }
}

onMounted(fetchData)
</script>

<style scoped>
.reparaciones-list {
  animation: fadeIn 0.4s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.page-header {
  margin-bottom: 20px;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #64748b;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
  padding: 6px 12px;
  border-radius: 8px;
  transition: all 0.2s;
}

.back-link:hover {
  color: #3b82f6;
  background: #eff6ff;
}

.back-link .material-symbols-rounded {
  font-size: 20px;
}

.auto-hero {
  background: linear-gradient(135deg, #0f172a, #1e293b);
  border-radius: 20px;
  padding: 28px 32px;
  margin-bottom: 28px;
  color: #ffffff;
}

.hero-left {
  display: flex;
  align-items: center;
  gap: 18px;
}

.hero-icon {
  font-size: 40px;
  color: #60a5fa;
  font-variation-settings: 'FILL' 1;
  background: rgba(96, 165, 250, 0.12);
  padding: 14px;
  border-radius: 16px;
}

.auto-hero h2 {
  font-size: 1.5rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  margin-bottom: 8px;
}

.hero-badges {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: rgba(255, 255, 255, 0.1);
  padding: 5px 12px;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 500;
  color: #cbd5e1;
}

.badge .material-symbols-rounded {
  font-size: 16px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.section-icon {
  font-size: 32px;
  color: #8b5cf6;
  font-variation-settings: 'FILL' 1;
}

.section-title h1 {
  font-size: 1.4rem;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -0.02em;
}

.subtitle {
  color: #64748b;
  font-size: 0.85rem;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px 28px;
  color: #64748b;
  gap: 12px;
}

.loading-state .material-symbols-rounded {
  font-size: 40px;
  color: #8b5cf6;
}

.spin {
  animation: spin 1s linear infinite;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px 28px;
  background: #ffffff;
  border-radius: 16px;
  border: 2px dashed #e2e8f0;
  text-align: center;
  gap: 8px;
}

.empty-icon {
  font-size: 56px;
  color: #cbd5e1;
  font-variation-settings: 'FILL' 1;
  margin-bottom: 8px;
}

.empty-state h3 {
  font-size: 1.1rem;
  color: #334155;
  font-weight: 700;
}

.empty-state p {
  color: #94a3b8;
  margin-bottom: 16px;
}

.repairs-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.repair-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #ffffff;
  border-radius: 16px;
  padding: 18px 22px;
  border: 1px solid #e8ecf1;
  transition: all 0.2s ease;
  gap: 16px;
}

.repair-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
  transform: translateY(-1px);
}

.repair-left {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
  min-width: 0;
}

.repair-icon {
  font-size: 24px;
  color: #8b5cf6;
  background: #f5f3ff;
  padding: 10px;
  border-radius: 12px;
  flex-shrink: 0;
}

.repair-info h4 {
  font-size: 1rem;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 4px;
}

.repair-meta {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.meta-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.82rem;
  color: #64748b;
  font-weight: 500;
}

.meta-item .material-symbols-rounded {
  font-size: 16px;
  color: #94a3b8;
}

.repair-right {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-shrink: 0;
}

.repair-cost {
  font-size: 1.1rem;
  font-weight: 800;
  color: #059669;
  white-space: nowrap;
}

.btn-icon-delete {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border: none;
  background: #fef2f2;
  color: #ef4444;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-icon-delete:hover {
  background: #fee2e2;
  color: #dc2626;
  transform: scale(1.05);
}

.btn-icon-delete .material-symbols-rounded {
  font-size: 20px;
}

.total-card {
  display: flex;
  align-items: center;
  gap: 12px;
  background: linear-gradient(135deg, #f0fdf4, #dcfce7);
  border: 1px solid #bbf7d0;
  border-radius: 16px;
  padding: 18px 24px;
  margin-top: 8px;
}

.total-icon {
  font-size: 28px;
  color: #059669;
  font-variation-settings: 'FILL' 1;
}

.total-label {
  font-size: 0.95rem;
  font-weight: 600;
  color: #065f46;
  flex: 1;
}

.total-value {
  font-size: 1.4rem;
  font-weight: 800;
  color: #059669;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 22px;
  border: none;
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.2s ease;
  font-family: inherit;
}

.btn .material-symbols-rounded {
  font-size: 20px;
}

.btn-primary {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: #ffffff;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.25);
}

.btn-primary:hover {
  box-shadow: 0 4px 16px rgba(59, 130, 246, 0.4);
  transform: translateY(-1px);
}

.filter-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.filter-chips {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.filter-icon {
  font-size: 20px;
  color: #94a3b8;
}

.filter-chip {
  padding: 6px 14px;
  border: 1.5px solid #e2e8f0;
  border-radius: 20px;
  background: #ffffff;
  color: #64748b;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
}

.filter-chip:hover {
  border-color: #cbd5e1;
  background: #f8fafc;
}

.filter-chip.active {
  background: #0f172a;
  color: #ffffff;
  border-color: #0f172a;
}

.sort-wrapper {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.sort-icon {
  font-size: 20px;
  color: #94a3b8;
}

.sort-select {
  padding: 6px 12px;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  font-size: 0.82rem;
  font-weight: 600;
  font-family: inherit;
  color: #475569;
  background: #ffffff;
  cursor: pointer;
  transition: all 0.2s ease;
}

.sort-select:focus {
  outline: none;
  border-color: #8b5cf6;
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
}

.category-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 10px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  margin-bottom: 6px;
}

.category-badge .material-symbols-rounded {
  font-size: 14px;
}
</style>
