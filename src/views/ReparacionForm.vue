<template>
  <div class="reparacion-form">
    <div class="page-header">
      <router-link :to="`/autos/${autoId}/reparaciones`" class="back-link">
        <span class="material-symbols-rounded">arrow_back</span>
        Volver a Reparaciones
      </router-link>
    </div>
    <div class="card">
      <div class="card-header">
        <span class="material-symbols-rounded header-icon">build_circle</span>
        <div>
          <h1>Nueva Reparación</h1>
          <p class="header-sub">Registra un servicio o reparación</p>
        </div>
      </div>
      <form @submit.prevent="guardar" class="form-body">
        <div v-if="errorMsg" class="error-msg">
          <span class="material-symbols-rounded">error</span>
          <span>{{ errorMsg }}</span>
        </div>
        <div class="form-grid">
          <div class="form-group full-width">
            <label for="descripcion">
              <span class="material-symbols-rounded label-icon">description</span>
              Descripción
            </label>
            <input id="descripcion" v-model="form.descripcion" type="text" required placeholder="Ej. Cambio de aceite y filtro" />
          </div>
          <div class="form-group full-width">
            <label for="categoria">
              <span class="material-symbols-rounded label-icon">category</span>
              Categoría
            </label>
            <div class="select-wrapper">
              <select id="categoria" v-model="form.categoria" required>
                <option value="" disabled>Selecciona una categoría</option>
                <option v-for="cat in categorias" :key="cat.value" :value="cat.value">{{ cat.label }}</option>
              </select>
              <span class="material-symbols-rounded select-arrow">expand_more</span>
            </div>
          </div>
          <div class="form-group">
            <label for="kilometraje">
              <span class="material-symbols-rounded label-icon">speed</span>
              Kilometraje
            </label>
            <input id="kilometraje" v-model.number="form.kilometraje" type="number" required min="0" placeholder="Ej. 55000" />
          </div>
          <div class="form-group">
            <label for="costo">
              <span class="material-symbols-rounded label-icon">payments</span>
              Costo ($)
            </label>
            <input id="costo" v-model.number="form.costo" type="number" required min="0" step="0.01" placeholder="Ej. 1500.00" />
          </div>
          <div class="form-group">
            <label>
              <span class="material-symbols-rounded label-icon">event</span>
              Fecha
            </label>
            <VueDatePicker
              v-model="fechaReparacion"
              :enable-time-picker="false"
              :formats="{ input: formatDateDisplay }"
              :locale="es"
              auto-apply
              placeholder="Selecciona una fecha"
              :dark="false"
              input-class-name="dp-custom-input"
              menu-class-name="dp-custom-menu"
              :required="true"
            >
              <template #input-icon>
                <span class="material-symbols-rounded dp-icon">calendar_month</span>
              </template>
            </VueDatePicker>
          </div>
        </div>
        <div class="form-actions">
          <button type="submit" class="btn btn-primary">
            <span class="material-symbols-rounded">save</span>
            Guardar Reparación
          </button>
          <router-link :to="`/autos/${autoId}/reparaciones`" class="btn btn-ghost">
            <span class="material-symbols-rounded">close</span>
            Cancelar
          </router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { VueDatePicker } from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'
import { es } from 'date-fns/locale'
import api from '../api/axios.js'

const route = useRoute()
const router = useRouter()
const autoId = route.params.id

const errorMsg = ref('')
const fechaReparacion = ref(null)

const categorias = [
  { value: 'MECANICA', label: 'Mecánica' },
  { value: 'ELECTRICA', label: 'Eléctrica' },
  { value: 'CARROCERIA', label: 'Carrocería' },
  { value: 'LLANTAS', label: 'Llantas' },
  { value: 'SERVICIO_PREVENTIVO', label: 'Servicio Preventivo' },
  { value: 'OTRO', label: 'Otro' }
]

const form = ref({
  descripcion: '',
  categoria: '',
  kilometraje: null,
  costo: null,
  fecha: ''
})

const formatDateDisplay = (date) => {
  if (!date) return ''
  const d = new Date(date)
  return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' })
}

watch(fechaReparacion, (val) => {
  if (val) {
    const d = new Date(val)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    form.value.fecha = `${year}-${month}-${day}`
  } else {
    form.value.fecha = ''
  }
})

const guardar = async () => {
  errorMsg.value = ''
  if (!form.value.fecha) {
    errorMsg.value = 'Por favor selecciona una fecha.'
    return
  }
  try {
    await api.post(`/autos/${autoId}/reparaciones`, form.value)
    router.push(`/autos/${autoId}/reparaciones`)
  } catch (error) {
    errorMsg.value = 'Error al guardar la reparación. Verifica los datos e intenta de nuevo.'
  }
}
</script>

<style scoped>
.reparacion-form {
  max-width: 680px;
  margin: 0 auto;
  animation: fadeIn 0.4s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
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
  color: #8b5cf6;
  background: #f5f3ff;
}

.back-link .material-symbols-rounded {
  font-size: 20px;
}

.card {
  background: #ffffff;
  border-radius: 20px;
  border: 1px solid #e8ecf1;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 28px 32px;
  background: linear-gradient(135deg, #faf5ff, #f3e8ff);
  border-bottom: 1px solid #e8ecf1;
  border-radius: 20px 20px 0 0;
}

.header-icon {
  font-size: 36px;
  color: #8b5cf6;
  font-variation-settings: 'FILL' 1;
  background: #ffffff;
  padding: 12px;
  border-radius: 14px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.card-header h1 {
  font-size: 1.4rem;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -0.02em;
}

.header-sub {
  color: #64748b;
  font-size: 0.88rem;
  margin-top: 2px;
}

.form-body {
  padding: 32px;
}

.error-msg {
  display: flex;
  align-items: center;
  gap: 10px;
  background: linear-gradient(135deg, #fef2f2, #fee2e2);
  border: 1px solid #fecaca;
  color: #dc2626;
  padding: 14px 18px;
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 500;
  margin-bottom: 24px;
}

.error-msg .material-symbols-rounded {
  font-size: 22px;
  font-variation-settings: 'FILL' 1;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.full-width {
  grid-column: 1 / -1;
}

@media (max-width: 600px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}

.form-group label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
}

.label-icon {
  font-size: 18px;
  color: #94a3b8;
}

.form-group input {
  width: 100%;
  padding: 12px 16px;
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  font-size: 0.95rem;
  font-family: inherit;
  color: #1e293b;
  background-color: #fafbfc;
  transition: all 0.2s ease;
}

.form-group input:focus {
  outline: none;
  border-color: #8b5cf6;
  background-color: #ffffff;
  box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.1);
}

.form-group input::placeholder {
  color: #b0b8c4;
}

.select-wrapper {
  position: relative;
}

.select-wrapper select {
  width: 100%;
  padding: 12px 44px 12px 16px;
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  font-size: 0.95rem;
  font-family: inherit;
  color: #1e293b;
  background-color: #fafbfc;
  appearance: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.select-wrapper select:focus {
  outline: none;
  border-color: #8b5cf6;
  background-color: #ffffff;
  box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.1);
}

.select-wrapper select option[value=""][disabled] {
  color: #b0b8c4;
}

.select-arrow {
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 22px;
  color: #94a3b8;
  pointer-events: none;
}

.dp-icon {
  font-size: 20px;
  color: #94a3b8;
  margin-left: 8px;
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #f1f5f9;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 28px;
  border: none;
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  text-align: center;
  transition: all 0.2s ease;
  font-family: inherit;
}

.btn .material-symbols-rounded {
  font-size: 20px;
}

.btn-primary {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
  color: #ffffff;
  box-shadow: 0 2px 8px rgba(139, 92, 246, 0.25);
}

.btn-primary:hover {
  box-shadow: 0 4px 16px rgba(139, 92, 246, 0.4);
  transform: translateY(-1px);
}

.btn-ghost {
  background: transparent;
  color: #64748b;
  border: 1.5px solid #e2e8f0;
}

.btn-ghost:hover {
  background: #f8fafc;
  color: #475569;
  border-color: #cbd5e1;
}
</style>

<style>
.dp-custom-input {
  padding: 12px 16px !important;
  border: 1.5px solid #e2e8f0 !important;
  border-radius: 12px !important;
  font-size: 0.95rem !important;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif !important;
  color: #1e293b !important;
  background-color: #fafbfc !important;
  transition: all 0.2s ease !important;
}

.dp-custom-input:focus {
  border-color: #8b5cf6 !important;
  background-color: #ffffff !important;
  box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.1) !important;
}

.dp-custom-input::placeholder {
  color: #b0b8c4 !important;
}

.dp-custom-menu {
  border-radius: 16px !important;
  border: 1px solid #e8ecf1 !important;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12) !important;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif !important;
}

.dp__theme_light {
  --dp-primary-color: #8b5cf6;
  --dp-primary-text-color: #ffffff;
  --dp-border-color: #e2e8f0;
  --dp-menu-border-color: #e8ecf1;
  --dp-hover-color: #f5f3ff;
  --dp-hover-text-color: #1e293b;
  --dp-background-color: #ffffff;
  --dp-text-color: #1e293b;
  --dp-secondary-color: #94a3b8;
  --dp-border-radius: 12px;
}
</style>
