<template>
  <div class="autos-list">
    <div class="page-header">
      <div class="page-header-left">
        <h1>
          <span class="material-symbols-rounded page-icon">garage</span>
          Mis Autos
        </h1>
        <p class="subtitle">
          <template v-if="busqueda.trim()">
            {{ autosFiltrados.length }} de {{ autos.length }} vehículo{{ autos.length !== 1 ? 's' : '' }}
          </template>
          <template v-else>
            {{ autos.length }} vehículo{{ autos.length !== 1 ? 's' : '' }} registrado{{ autos.length !== 1 ? 's' : '' }}
          </template>
        </p>
      </div>
      <router-link to="/agregar" class="btn btn-primary">
        <span class="material-symbols-rounded">add</span>
        Nuevo Auto
      </router-link>
    </div>

    <div v-if="!loading && autos.length > 0" class="search-bar">
      <div class="search-input-wrapper">
        <span class="material-symbols-rounded search-icon">search</span>
        <input
          v-model="busqueda"
          type="text"
          placeholder="Buscar por marca, modelo o placas..."
          class="search-input"
        />
        <button v-if="busqueda" @click="busqueda = ''" class="search-clear">
          <span class="material-symbols-rounded">close</span>
        </button>
      </div>
      <div class="sort-wrapper">
        <span class="material-symbols-rounded sort-icon">sort</span>
        <select v-model="ordenarPor" class="sort-select">
          <option v-for="op in ordenOpciones" :key="op.value" :value="op.value">{{ op.label }}</option>
        </select>
      </div>
    </div>

    <div v-if="loading" class="loading-state">
      <span class="material-symbols-rounded spin">progress_activity</span>
      <p>Cargando vehículos...</p>
    </div>

    <div v-else-if="autos.length === 0" class="empty-state">
      <span class="material-symbols-rounded empty-icon">directions_car</span>
      <h3>Sin vehículos</h3>
      <p>Agrega tu primer auto para comenzar</p>
      <router-link to="/agregar" class="btn btn-primary">
        <span class="material-symbols-rounded">add</span>
        Agregar Auto
      </router-link>
    </div>

    <div v-else-if="autosFiltrados.length === 0 && busqueda.trim()" class="empty-state">
      <span class="material-symbols-rounded empty-icon">search_off</span>
      <h3>Sin resultados</h3>
      <p>No se encontraron vehículos para "{{ busqueda }}"</p>
      <button @click="busqueda = ''" class="btn btn-primary">
        <span class="material-symbols-rounded">clear_all</span>
        Limpiar Búsqueda
      </button>
    </div>

    <div v-else class="cards-grid">
      <div v-for="auto in autosFiltrados" :key="auto.id" class="auto-card">
        <div class="auto-card-header">
          <div class="auto-card-title">
            <span class="material-symbols-rounded car-icon">directions_car</span>
            <div>
              <h3>{{ auto.marca }} {{ auto.modelo }}</h3>
              <span class="badge-placas">
                <span class="material-symbols-rounded badge-icon">confirmation_number</span>
                {{ auto.placas }}
              </span>
            </div>
          </div>
          <span class="badge-year">{{ auto.anio }}</span>
        </div>
        <div class="auto-card-body">
          <div class="stat">
            <span class="material-symbols-rounded stat-icon">speed</span>
            <div>
              <span class="stat-value">{{ auto.kilometraje?.toLocaleString() }}</span>
              <span class="stat-label">km</span>
            </div>
          </div>
          <div class="stat">
            <span class="material-symbols-rounded stat-icon">build</span>
            <div>
              <span class="stat-value">{{ auto.reparaciones?.length || 0 }}</span>
              <span class="stat-label">reparaciones</span>
            </div>
          </div>
          <div class="stat">
            <span class="material-symbols-rounded stat-icon">event</span>
            <div>
              <span class="stat-value">{{ formatDate(auto.fechaUltimoMantenimiento) }}</span>
              <span class="stat-label">últ. mant.</span>
            </div>
          </div>
        </div>
        <div class="auto-card-actions">
          <router-link :to="`/editar/${auto.id}`" class="btn-action btn-edit" title="Editar">
            <span class="material-symbols-rounded">edit</span>
            Editar
          </router-link>
          <router-link :to="`/autos/${auto.id}/reparaciones`" class="btn-action btn-repairs" title="Reparaciones">
            <span class="material-symbols-rounded">build_circle</span>
            Reparaciones
          </router-link>
          <button @click="eliminar(auto.id)" class="btn-action btn-delete" title="Eliminar">
            <span class="material-symbols-rounded">delete</span>
            Eliminar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '../api/axios.js'

const autos = ref([])
const loading = ref(true)
const busqueda = ref('')
const ordenarPor = ref('marca_asc')

const ordenOpciones = [
  { value: 'marca_asc', label: 'Marca (A-Z)' },
  { value: 'anio_desc', label: 'Año (reciente)' },
  { value: 'km_asc', label: 'Kilometraje (menor)' },
  { value: 'reparaciones_desc', label: 'Más reparaciones' }
]

const autosFiltrados = computed(() => {
  let lista = autos.value
  if (busqueda.value.trim()) {
    const q = busqueda.value.trim().toLowerCase()
    lista = lista.filter(a =>
      a.marca?.toLowerCase().includes(q) ||
      a.modelo?.toLowerCase().includes(q) ||
      a.placas?.toLowerCase().includes(q)
    )
  }
  const sorted = [...lista]
  switch (ordenarPor.value) {
    case 'marca_asc': sorted.sort((a, b) => (a.marca || '').localeCompare(b.marca || '')); break
    case 'anio_desc': sorted.sort((a, b) => (b.anio || 0) - (a.anio || 0)); break
    case 'km_asc': sorted.sort((a, b) => (a.kilometraje || 0) - (b.kilometraje || 0)); break
    case 'reparaciones_desc': sorted.sort((a, b) => (b.reparaciones?.length || 0) - (a.reparaciones?.length || 0)); break
  }
  return sorted
})

const formatDate = (date) => {
  if (!date) return '---'
  return new Date(date + 'T00:00:00').toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
}

const fetchAutos = async () => {
  try {
    const response = await api.get('/autos')
    autos.value = response.data
  } catch (error) {
    autos.value = []
  } finally {
    loading.value = false
  }
}

const eliminar = async (id) => {
  if (!confirm('¿Estás seguro de que deseas eliminar este auto?')) return
  try {
    await api.delete(`/autos/${id}`)
    autos.value = autos.value.filter(a => a.id !== id)
  } catch (error) {
    alert('Error al eliminar el auto.')
  }
}

onMounted(fetchAutos)
</script>

<style scoped>
.autos-list {
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
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 28px;
  flex-wrap: wrap;
  gap: 16px;
}

.page-header h1 {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.75rem;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -0.03em;
}

.page-icon {
  font-size: 32px;
  color: #3b82f6;
  font-variation-settings: 'FILL' 1;
}

.subtitle {
  color: #64748b;
  font-size: 0.9rem;
  margin-top: 4px;
  margin-left: 42px;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 28px;
  color: #64748b;
  gap: 12px;
}

.loading-state .material-symbols-rounded {
  font-size: 40px;
  color: #3b82f6;
}

.spin {
  animation: spin 1s linear infinite;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 28px;
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
  font-size: 1.2rem;
  color: #334155;
  font-weight: 700;
}

.empty-state p {
  color: #94a3b8;
  margin-bottom: 16px;
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 20px;
}

.auto-card {
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid #e8ecf1;
  overflow: hidden;
  transition: box-shadow 0.25s ease, transform 0.25s ease;
}

.auto-card:hover {
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

.auto-card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 20px 22px 0;
}

.auto-card-title {
  display: flex;
  align-items: flex-start;
  gap: 14px;
}

.car-icon {
  font-size: 36px;
  color: #3b82f6;
  font-variation-settings: 'FILL' 1;
  background: linear-gradient(135deg, #eff6ff, #dbeafe);
  padding: 10px;
  border-radius: 14px;
}

.auto-card-title h3 {
  font-size: 1.1rem;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 4px;
}

.badge-placas {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: #f1f5f9;
  color: #475569;
  padding: 3px 10px;
  border-radius: 6px;
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.04em;
}

.badge-icon {
  font-size: 14px;
}

.badge-year {
  background: linear-gradient(135deg, #0f172a, #1e293b);
  color: #ffffff;
  padding: 4px 12px;
  border-radius: 8px;
  font-size: 0.82rem;
  font-weight: 700;
}

.auto-card-body {
  display: flex;
  gap: 6px;
  padding: 18px 22px;
}

.stat {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f8fafc;
  padding: 10px 12px;
  border-radius: 10px;
}

.stat-icon {
  font-size: 20px;
  color: #94a3b8;
}

.stat-value {
  display: block;
  font-size: 0.88rem;
  font-weight: 700;
  color: #1e293b;
  line-height: 1.2;
}

.stat-label {
  display: block;
  font-size: 0.7rem;
  color: #94a3b8;
  font-weight: 500;
}

.auto-card-actions {
  display: flex;
  border-top: 1px solid #f1f5f9;
}

.btn-action {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 12px;
  border: none;
  background: transparent;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  font-family: inherit;
  border-right: 1px solid #f1f5f9;
}

.btn-action:last-child {
  border-right: none;
}

.btn-action .material-symbols-rounded {
  font-size: 18px;
}

.btn-edit {
  color: #3b82f6;
}

.btn-edit:hover {
  background: #eff6ff;
  color: #2563eb;
}

.btn-repairs {
  color: #8b5cf6;
}

.btn-repairs:hover {
  background: #f5f3ff;
  color: #7c3aed;
}

.btn-delete {
  color: #ef4444;
}

.btn-delete:hover {
  background: #fef2f2;
  color: #dc2626;
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

.search-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.search-input-wrapper {
  position: relative;
  flex: 1;
  min-width: 220px;
}

.search-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 22px;
  color: #94a3b8;
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 12px 44px 12px 46px;
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  font-size: 0.95rem;
  font-family: inherit;
  color: #1e293b;
  background-color: #ffffff;
  transition: all 0.2s ease;
}

.search-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
}

.search-input::placeholder {
  color: #b0b8c4;
}

.search-clear {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  background: #f1f5f9;
  color: #64748b;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.search-clear:hover {
  background: #e2e8f0;
  color: #334155;
}

.search-clear .material-symbols-rounded {
  font-size: 18px;
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
  padding: 12px 14px;
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  font-size: 0.88rem;
  font-weight: 600;
  font-family: inherit;
  color: #475569;
  background: #ffffff;
  cursor: pointer;
  transition: all 0.2s ease;
}

.sort-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}
</style>
