const company = document.querySelector('#company');
const result = document.querySelector('#result');
const buttons = [...document.querySelectorAll('[data-right]')];
let entities = [];
let selectedRight = 'acceso';

const labels = {
  acceso: 'Ver mis datos',
  rectificacion: 'Corregir mis datos',
  supresion: 'Solicitar supresión',
  'retiro-marketing': 'Salir de marketing'
};

async function boot() {
  try {
    const res = await fetch('../data/empresas.json');
    const data = await res.json();
    entities = data.entities || [];
    entities.forEach(entity => {
      const option = document.createElement('option');
      option.value = entity.slug;
      option.textContent = entity.name;
      company.appendChild(option);
    });
  } catch (error) {
    result.classList.remove('hidden');
    result.innerHTML = '<h2>No pudimos cargar el directorio</h2><p>Abrí esta web desde un servidor HTTP o GitHub Pages para que pueda leer el dataset.</p>';
  }
}

function render() {
  const entity = entities.find(e => e.slug === company.value);
  if (!entity) return result.classList.add('hidden');

  const supported = (entity.rights || []).includes(selectedRight) ||
    (selectedRight === 'rectificacion' && (entity.rights || []).includes('actualizacion'));
  const channel = (entity.request_channels || []).join(', ') || 'todavía no documentado';
  const status = entity.verification_status || 'pendiente';

  result.classList.remove('hidden');
  result.innerHTML = `
    <span class="badge">${status}</span>
    <h2>${entity.name}</h2>
    <p><strong>Objetivo:</strong> ${labels[selectedRight]}</p>
    <p>${supported ? 'Este derecho aparece documentado para esta entidad.' : 'Todavía no tenemos este derecho documentado de forma específica para esta entidad. No significa que no exista: falta verificar el procedimiento.'}</p>
    <p><strong>Canal documentado:</strong> ${channel}</p>
    ${entity.contact ? `<p><strong>Contacto:</strong> ${entity.contact}</p>` : ''}
    ${entity.identity_requirement ? `<p><strong>Identidad:</strong> ${entity.identity_requirement}</p>` : ''}
    ${entity.notes ? `<p>${entity.notes}</p>` : ''}
    <p><a href="${entity.official_privacy_url}" target="_blank" rel="noreferrer">Abrir fuente oficial ↗</a></p>
    <p><small>Última verificación: ${entity.verified_at || 'sin fecha'}</small></p>`;
}

company.addEventListener('change', render);
buttons.forEach(button => button.addEventListener('click', () => {
  selectedRight = button.dataset.right;
  buttons.forEach(b => b.classList.toggle('active', b === button));
  render();
}));
buttons[0].classList.add('active');
boot();
