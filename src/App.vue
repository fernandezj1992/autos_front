<template>
  <div class="app">
    <nav class="navbar">
      <div class="nav-container">
        <router-link to="/" class="nav-brand">
          <span class="material-symbols-rounded brand-icon">directions_car</span>
          <span>AutoManager</span>
        </router-link>
        <div class="nav-links">
          <router-link to="/" class="nav-link">
            <span class="material-symbols-rounded">list_alt</span>
            <span>Mis Autos</span>
          </router-link>
          <router-link to="/agregar" class="nav-link nav-link-cta">
            <span class="material-symbols-rounded">add_circle</span>
            <span>Nuevo Auto</span>
          </router-link>
        </div>
      </div>
    </nav>
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  background-color: #f0f2f5;
  color: #1a1a2e;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}

.material-symbols-rounded {
  font-family: 'Material Symbols Rounded';
  font-variation-settings: 'FILL' 0, 'wght' 500, 'GRAD' 0, 'opsz' 24;
  font-weight: normal;
  font-style: normal;
  font-size: 24px;
  line-height: 1;
  letter-spacing: normal;
  text-transform: none;
  display: inline-block;
  white-space: nowrap;
  word-wrap: normal;
  direction: ltr;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
  font-feature-settings: 'liga';
  vertical-align: middle;
}

.app {
  min-height: 100vh;
}

.navbar {
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  padding: 0 24px;
  position: sticky;
  top: 0;
  z-index: 100;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(12px);
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 68px;
}

.nav-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.3rem;
  font-weight: 800;
  color: #ffffff;
  text-decoration: none;
  letter-spacing: -0.03em;
}

.brand-icon {
  font-size: 28px;
  color: #60a5fa;
  font-variation-settings: 'FILL' 1, 'wght' 600;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 6px;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #94a3b8;
  text-decoration: none;
  padding: 8px 16px;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.nav-link .material-symbols-rounded {
  font-size: 20px;
}

.nav-link:hover {
  background-color: rgba(255, 255, 255, 0.08);
  color: #e2e8f0;
}

.nav-link.router-link-exact-active {
  background-color: rgba(96, 165, 250, 0.15);
  color: #60a5fa;
}

.nav-link-cta {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: #ffffff !important;
  font-weight: 600;
}

.nav-link-cta:hover {
  background: linear-gradient(135deg, #2563eb, #1d4ed8) !important;
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4);
  transform: translateY(-1px);
}

.main-content {
  max-width: 1200px;
  margin: 32px auto;
  padding: 0 24px;
}
</style>
