export type Category = "Perros" | "Gatos" | "Pequeñas mascotas" | "Higiene";

export type Product = {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: Category;
  description: string;
  images: string[];
  featured?: boolean;
};

const product = (
  id: string,
  name: string,
  price: number,
  stock: number,
  category: Category,
  description: string,
  imageCount = 2,
  featured = false,
): Product => ({
  id,
  name,
  price,
  stock,
  category,
  description,
  images: Array.from({ length: imageCount }, (_, index) => `/products/${id}/${index + 1}.jpg`),
  featured,
});

export const products: Product[] = [
  product("arenero-con-puerta", "Arenero con puerta", 21600, 23, "Gatos", "Arenero cerrado que ayuda a mantener el espacio limpio y controlar olores.", 2, true),
  product("arnes-de-conejo", "Arnés de conejo", 3600, 2, "Pequeñas mascotas", "Arnés liviano y cómodo para paseos seguros.", 3),
  product("bebedero", "Bebedero", 19200, 3, "Perros", "Bebedero práctico para mantener agua disponible durante el día.", 2, true),
  product("bolsas-para-desechos-con-deposito", "Bolsas para desechos con depósito", 2400, 4, "Higiene", "Dispensador compacto con bolsas para paseos más cómodos.", 2),
  product("canil", "Canil", 33600, 1, "Perros", "Canil resistente para traslados seguros y cómodos.", 2, true),
  product("catnip", "Catnip", 3600, 8, "Gatos", "Estimulación natural para enriquecer el juego de tu gato.", 2),
  product("cepillo-para-mascota-de-pelo-corto", "Cepillo para pelo corto", 8400, 2, "Higiene", "Retira pelo suelto y ayuda a mantener el pelaje saludable.", 2),
  product("cepillo-sacapelusas", "Cepillo sacapelusas", 4800, 3, "Higiene", "Ideal para retirar pelos de ropa, sillones y textiles.", 2),
  product("collar-de-cuero-con-tirante", "Collar de cuero con tirante", 12000, 3, "Perros", "Set de collar y correa con terminación clásica.", 2),
  product("collar-panuelo-y-cascabel", "Collar pañuelo y cascabel", 1200, 10, "Gatos", "Collar liviano con pañuelo decorativo y cascabel.", 2),
  product("collar-puas-raza-grande", "Collar púas raza grande", 6000, 0, "Perros", "Collar robusto para perros de raza grande.", 1),
  product("collares-con-panuelo", "Collares con pañuelo", 2400, 0, "Perros", "Collar decorativo con pañuelo en distintos diseños.", 4),
  product("corrales", "Corrales", 30000, 3, "Pequeñas mascotas", "Espacio modular y seguro para juego o descanso.", 4, true),
  product("corta-unas", "Cortaúñas", 3600, 6, "Higiene", "Corte preciso para el cuidado regular de las uñas.", 2),
  product("esfera-de-hamsters-talla-s", "Esfera para hámster talla S", 6000, 2, "Pequeñas mascotas", "Esfera ventilada para actividad supervisada.", 2),
  product("esfera-de-hamsters-talla-m", "Esfera para hámster talla M", 7200, 2, "Pequeñas mascotas", "Más espacio para que tu pequeña mascota explore de forma supervisada.", 2),
  product("juguete-de-goma-hamburguesa", "Juguete de goma hamburguesa", 1200, 1, "Perros", "Juguete de goma con forma divertida para morder y jugar.", 3),
  product("juguete-de-pelota-con-cordel", "Pelota con cordel", 1800, 2, "Perros", "Pelota con cuerda para juegos de tirar y buscar.", 2),
  product("mamadera-4-salidas", "Mamadera 4 salidas", 9000, 3, "Pequeñas mascotas", "Alimentación simultánea para camadas pequeñas.", 1),
  product("maquina-de-cortar-pelo", "Máquina de cortar pelo", 18000, 1, "Higiene", "Máquina práctica para mantener el pelaje en casa.", 2, true),
  product("mochilas-capsula", "Mochila cápsula", 20400, 5, "Gatos", "Transportador tipo mochila con ventana panorámica y ventilación.", 1, true),
  product("pelota-cordel-en-8", "Pelota cordel en 8", 3600, 1, "Perros", "Juguete de cuerda resistente para juego interactivo.", 1),
  product("pelota-cordel-en-esquina", "Pelota cordel en esquina", 3600, 1, "Perros", "Combinación de cuerda y pelota para entretención activa.", 1),
  product("perchera-con-cascabel-cuadrille", "Pechera con cascabel cuadrillé", 4200, 2, "Gatos", "Pechera ajustable de diseño cuadrillé con cascabel.", 2),
  product("perchera-de-color-simple-talla-s", "Pechera color simple talla S", 4200, 1, "Perros", "Pechera liviana para mascotas pequeñas.", 1),
  product("plato-comelento", "Plato comelento", 3000, 4, "Perros", "Diseño que ayuda a comer más lento y favorece una mejor digestión.", 1),
  product("plato-para-perro", "Plato para perro", 6000, 0, "Perros", "Plato de uso diario, estable y fácil de limpiar.", 3),
  product("platos-altos", "Platos altos", 4200, 3, "Gatos", "Comedero elevado para una postura más cómoda.", 2),
  product("retractil", "Correa retráctil", 6000, 2, "Perros", "Mayor libertad de movimiento con control durante el paseo.", 2),
  product("saca-nudo-l", "Sacanudos talla L", 4800, 3, "Higiene", "Ayuda a desenredar y retirar nudos del pelaje.", 6),
  product("secador-de-pelo", "Secador de pelo", 19200, 1, "Higiene", "Secado cómodo del pelaje después del baño.", 2),
  product("spinner-de-goma", "Spinner de goma", 1200, 2, "Perros", "Juguete flexible de goma para morder y perseguir.", 2),
  product("transportador-chico-de-gato", "Transportador chico de gato", 12000, 1, "Gatos", "Transportador compacto para visitas y viajes cortos.", 2),
  product("transportador-con-ventana", "Transportador con ventana", 18000, 2, "Gatos", "Transportador ventilado con ventana para observar el entorno.", 2),
  product("transportador-mediano-de-gato", "Transportador mediano de gato", 18000, 0, "Gatos", "Espacio cómodo y seguro para traslados de gatos medianos.", 1),
];

export const categories: Array<"Todos" | Category> = ["Todos", "Perros", "Gatos", "Pequeñas mascotas", "Higiene"];

export const getProduct = (id: string) => products.find((item) => item.id === id);
