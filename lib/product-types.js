export const PRODUCT_TYPES = [
  { value: 'other', label: 'General / Otro', specs: [] },
  {
    value: 'ram',
    label: 'Memoria RAM',
    specs: [
      { key: 'capacity', label: 'Capacidad', placeholder: 'Ej: 16GB (2x8GB)' },
      { key: 'type', label: 'Tipo', placeholder: 'Ej: DDR5, DDR4' },
      { key: 'speed', label: 'Velocidad de bus', placeholder: 'Ej: 6000MHz' },
      { key: 'latency', label: 'Latencia (CL)', placeholder: 'Ej: CL30' },
      { key: 'voltage', label: 'Voltaje', placeholder: 'Ej: 1.35V' },
      { key: 'xmp', label: 'Perfil XMP / EXPO', placeholder: 'Ej: XMP 3.0, EXPO' },
      { key: 'format', label: 'Formato', placeholder: 'Ej: DIMM, SODIMM' },
    ],
  },
  {
    value: 'processor',
    label: 'Procesador',
    specs: [
      { key: 'socket', label: 'Socket', placeholder: 'Ej: LGA1700, AM5' },
      { key: 'cores', label: 'Núcleos / Hilos', placeholder: 'Ej: 8 / 16' },
      { key: 'base_clock', label: 'Frecuencia base', placeholder: 'Ej: 3.4GHz' },
      { key: 'boost_clock', label: 'Frecuencia turbo', placeholder: 'Ej: 5.0GHz' },
      { key: 'tdp', label: 'TDP', placeholder: 'Ej: 65W' },
    ],
  },
  {
    value: 'motherboard',
    label: 'Motherboard',
    specs: [
      { key: 'socket', label: 'Socket', placeholder: 'Ej: LGA1700, AM5' },
      { key: 'chipset', label: 'Chipset', placeholder: 'Ej: Z790, B650' },
      { key: 'form_factor', label: 'Factor de forma', placeholder: 'Ej: ATX, Micro-ATX' },
      { key: 'memory_slots', label: 'Slots de RAM', placeholder: 'Ej: 4x DDR5' },
      { key: 'm2_slots', label: 'Slots M.2', placeholder: 'Ej: 3' },
    ],
  },
  {
    value: 'ssd',
    label: 'SSD / Almacenamiento',
    specs: [
      { key: 'capacity', label: 'Capacidad', placeholder: 'Ej: 1TB' },
      { key: 'interface', label: 'Interfaz', placeholder: 'Ej: M.2 NVMe PCIe 4.0' },
      { key: 'read_speed', label: 'Velocidad lectura', placeholder: 'Ej: 7000MB/s' },
      { key: 'write_speed', label: 'Velocidad escritura', placeholder: 'Ej: 5000MB/s' },
      { key: 'format', label: 'Formato', placeholder: 'Ej: M.2 2280, 2.5"' },
    ],
  },
  {
    value: 'gpu',
    label: 'Placa de Video',
    specs: [
      { key: 'vram', label: 'VRAM', placeholder: 'Ej: 12GB GDDR6X' },
      { key: 'chip', label: 'Chip', placeholder: 'Ej: RTX 4070, RX 7800 XT' },
      { key: 'interface', label: 'Interfaz', placeholder: 'Ej: PCIe 4.0 x16' },
      { key: 'ports', label: 'Puertos', placeholder: 'Ej: 3x DP, 1x HDMI' },
    ],
  },
  {
    value: 'psu',
    label: 'Fuente de Poder',
    specs: [
      { key: 'wattage', label: 'Potencia', placeholder: 'Ej: 750W' },
      { key: 'certification', label: 'Certificación', placeholder: 'Ej: 80+ Gold' },
      { key: 'modular', label: 'Modular', placeholder: 'Ej: Full, Semi, No' },
    ],
  },
]

export function getProductType(value) {
  return PRODUCT_TYPES.find((t) => t.value === value) || PRODUCT_TYPES[0]
}
