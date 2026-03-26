<template>
  <div class="auto-form">
    <div class="page-header">
      <router-link to="/" class="back-link">
        <span class="material-symbols-rounded">arrow_back</span>
        Volver
      </router-link>
    </div>
    <div class="card">
      <div class="card-header">
        <span class="material-symbols-rounded header-icon">{{ isEdit ? 'edit_note' : 'add_circle' }}</span>
        <div>
          <h1>{{ isEdit ? 'Editar Auto' : 'Nuevo Auto' }}</h1>
          <p class="header-sub">{{ isEdit ? 'Modifica los datos del vehículo' : 'Registra un nuevo vehículo' }}</p>
        </div>
      </div>
      <form @submit.prevent="guardar" class="form-body">
        <div v-if="errorMsg" class="error-msg">
          <span class="material-symbols-rounded">error</span>
          <span>{{ errorMsg }}</span>
        </div>
        <div v-if="successMsg" class="success-msg">
          <span class="material-symbols-rounded">check_circle</span>
          <span>{{ successMsg }}</span>
        </div>
        <div class="form-grid">
          <div class="form-group">
            <label for="marca">
              <span class="material-symbols-rounded label-icon">label</span>
              Marca
            </label>
            <div class="select-wrapper">
              <select id="marca" v-model="form.marca" required>
                <option value="" disabled>Selecciona una marca</option>
                <option v-for="m in marcas" :key="m" :value="m">{{ m }}</option>
              </select>
              <span class="material-symbols-rounded select-arrow">expand_more</span>
            </div>
          </div>
          <div class="form-group">
            <label for="modelo">
              <span class="material-symbols-rounded label-icon">directions_car</span>
              Modelo
            </label>
            <input id="modelo" v-model="form.modelo" type="text" required placeholder="Ej. Corolla" />
          </div>
          <div class="form-group">
            <label for="anio">
              <span class="material-symbols-rounded label-icon">calendar_today</span>
              Año
            </label>
            <input id="anio" v-model.number="form.anio" type="number" required min="1900" max="2100" placeholder="Ej. 2024" />
          </div>
          <div class="form-group">
            <label for="kilometraje">
              <span class="material-symbols-rounded label-icon">speed</span>
              Kilometraje
            </label>
            <input id="kilometraje" v-model.number="form.kilometraje" type="number" required min="0" placeholder="Ej. 50000" />
          </div>
          <div class="form-group">
            <label for="placas">
              <span class="material-symbols-rounded label-icon">confirmation_number</span>
              Placas
            </label>
            <input id="placas" v-model="form.placas" type="text" required placeholder="Ej. ABC-1234" />
          </div>
          <div class="form-group">
            <label>
              <span class="material-symbols-rounded label-icon">event</span>
              Último Mantenimiento
            </label>
            <VueDatePicker
              v-model="fechaMantenimiento"
              :enable-time-picker="false"
              :formats="{ input: formatDateDisplay }"
              :locale="es"
              auto-apply
              placeholder="Selecciona una fecha"
              :dark="false"
              input-class-name="dp-custom-input"
              menu-class-name="dp-custom-menu"
            >
              <template #input-icon>
                <span class="material-symbols-rounded dp-icon">calendar_month</span>
              </template>
            </VueDatePicker>
          </div>
        </div>
        <div class="form-actions">
          <button type="submit" class="btn btn-primary">
            <span class="material-symbols-rounded">{{ isEdit ? 'save' : 'add_circle' }}</span>
            {{ isEdit ? 'Guardar Cambios' : 'Registrar Auto' }}
          </button>
          <router-link to="/" class="btn btn-ghost">
            <span class="material-symbols-rounded">close</span>
            Cancelar
          </router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { VueDatePicker } from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'
import { es } from 'date-fns/locale'
import api from '../api/axios.js'

const route = useRoute()
const router = useRouter()

const isEdit = computed(() => !!route.params.id)
const errorMsg = ref('')
const successMsg = ref('')
const fechaMantenimiento = ref(null)

const marcas = [
  'Acura', 'Alfa Romeo', 'Audi',
  'BMW', 'Buick',
  'Cadillac', 'Chevrolet', 'Chrysler', 'Citroën',
  'Dodge',
  'Fiat', 'Ford',
  'GMC',
  'Honda', 'Hyundai',
  'Infiniti',
  'Jaguar', 'Jeep',
  'Kia',
  'Land Rover', 'Lexus', 'Lincoln',
  'Mazda', 'Mercedes-Benz', 'Mini', 'Mitsubishi',
  'Nissan',
  'Peugeot', 'Porsche',
  'RAM', 'Renault',
  'SEAT', 'Subaru', 'Suzuki',
  'Tesla', 'Toyota',
  'Volkswagen', 'Volvo'
]

const form = ref({
  marca: '',
  modelo: '',
  anio: null,
  kilometraje: null,
  placas: '',
  fechaUltimoMantenimiento: ''
})

const formatDateDisplay = (date) => {
  if (!date) return ''
  const d = new Date(date)
  return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' })
}

watch(fechaMantenimiento, (val) => {
  if (val) {
    const d = new Date(val)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    form.value.fechaUltimoMantenimiento = `${year}-${month}-${day}`
  } else {
    form.value.fechaUltimoMantenimiento = ''
  }
})

const cargarAuto = async () => {
  try {
    const response = await api.get(`/autos/${route.params.id}`)
    form.value = response.data
    if (form.value.fechaUltimoMantenimiento) {
      fechaMantenimiento.value = new Date(form.value.fechaUltimoMantenimiento + 'T12:00:00')
    }
  } catch (error) {
    errorMsg.value = 'Error al cargar los datos del auto.'
  }
}

const guardar = async () => {
  errorMsg.value = ''
  successMsg.value = ''
  try {
    if (isEdit.value) {
      await api.put(`/autos/${route.params.id}`, form.value)
    } else {
      await api.post('/autos', form.value)
    }
    router.push('/')
  } catch (error) {
    if (error.response && error.response.status === 409) {
      errorMsg.value = 'Ya existe un auto con esas placas. Por favor, usa unas placas diferentes.'
    } else {
      errorMsg.value = 'Error al guardar el auto. Verifica los datos e intenta de nuevo.'
    }
  }
}

onMounted(() => {
  if (isEdit.value) {
    cargarAuto()
  }
})
</script>

<style scoped>
.auto-form {
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
  color: #3b82f6;
  background: #eff6ff;
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
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
  border-bottom: 1px solid #e8ecf1;
  border-radius: 20px 20px 0 0;
}

.header-icon {
  font-size: 36px;
  color: #3b82f6;
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

.success-msg {
  display: flex;
  align-items: center;
  gap: 10px;
  background: linear-gradient(135deg, #f0fdf4, #dcfce7);
  border: 1px solid #bbf7d0;
  color: #16a34a;
  padding: 14px 18px;
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 500;
  margin-bottom: 24px;
}

.success-msg .material-symbols-rounded {
  font-size: 22px;
  font-variation-settings: 'FILL' 1;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
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
  border-color: #3b82f6;
  background-color: #ffffff;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
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
  border-color: #3b82f6;
  background-color: #ffffff;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
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
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: #ffffff;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.25);
}

.btn-primary:hover {
  box-shadow: 0 4px 16px rgba(59, 130, 246, 0.4);
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
  border-color: #3b82f6 !important;
  background-color: #ffffff !important;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1) !important;
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
  --dp-primary-color: #3b82f6;
  --dp-primary-text-color: #ffffff;
  --dp-border-color: #e2e8f0;
  --dp-menu-border-color: #e8ecf1;
  --dp-hover-color: #eff6ff;
  --dp-hover-text-color: #1e293b;
  --dp-background-color: #ffffff;
  --dp-text-color: #1e293b;
  --dp-secondary-color: #94a3b8;
  --dp-border-radius: 12px;
}
</style>
