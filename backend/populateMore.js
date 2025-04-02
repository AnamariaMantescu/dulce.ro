// Script pentru adăugarea produselor noi în Firestore fără a afecta produsele existente

const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Funcție care găsește următorul număr disponibil pentru un anumit prefix (ex: "cheesecake-1", "biscuiti-3")
async function getNextId(prefix) {
  const snapshot = await db.collection("products")
    .where("id", ">=", `${prefix}-0`)
    .where("id", "<", `${prefix}-z`)
    .get();

  let maxNumber = 0;
  snapshot.forEach(doc => {
    const id = doc.data().id;
    const parts = id.split("-");
    if (parts.length === 2) {
      const num = parseInt(parts[1]);
      if (!isNaN(num) && num > maxNumber) {
        maxNumber = num;
      }
    }
  });
  return maxNumber + 1;
}

async function addNewProducts() {
  // Lista produselor noi (10 produse "biscuiti" și 10 produse "cheesecake")
 const newProducts = [
  {
    name: "Cutie Cadou Premium",
    description: "O selecție de praline fine și macarons delicioase.",
    category: "cadouri",
    subcategory: "lux",
    price: 120,
    image: "https://www.joviebelle.ro/wp-content/uploads/2024/03/image00017.jpeg",
    allergens: ["gluten", "lapte", "nuci"],
    ingredients: ["Ciocolată Belgiană", "Alune de Pădure", "Migdală", "Zahăr", "Frișcă"],
    weight: 500,
    servings: 6,
    nutritional_values: { calories: 400, carbs: 50, fat: 18, protein: 4, sugar: 35 },
    special_notes: "Conține nuci și poate avea urme de soia.",
    storage_conditions: "A se păstra la loc răcoros și uscat",
    expiry_date: "15 zile de la livrare",
    availability: "disponibil",
    tags: ["cadou", "lux", "exclusiv"]
  },
  {
    name: "Cutie Gusturi de Crăciun",
    description: "Biscuiți cu scorțișoară, fursecuri cu gem și ciocolată caldă artizanală – toate în aceeași cutie festivă.",
    category: "cadouri",
    subcategory: "sezon",
    price: 95,
    image: "https://i.imgur.com/J2yNGcU.jpg",
    allergens: ["gluten", "lapte", "ouă"],
    ingredients: ["Făină", "Zahăr brun", "Unt", "Gem de caise", "Ciocolată", "Scorțișoară"],
    weight: 600,
    servings: 8,
    nutritional_values: { calories: 380, carbs: 48, fat: 16, protein: 3, sugar: 30 },
    special_notes: "Perfectă pentru serile reci și aromate.",
    storage_conditions: "A se păstra la loc uscat, închis ermetic",
    expiry_date: "10 zile de la livrare",
    availability: "disponibil",
    tags: ["cadou", "sărbători", "crăciun", "cozy"]
  },
  {
    name: "Cutie Vegană de Răsfăț",
    description: "Include bomboane raw, batoane cu semințe și trufe vegane cu ciocolată neagră.",
    category: "cadouri",
    subcategory: "vegan",
    price: 105,
    image: "https://i.imgur.com/CS3XDNk.jpg",
    allergens: ["nuci"],
    ingredients: ["Curmale", "Nuci caju", "Cacao", "Fulgi de cocos", "Sirop de agave"],
    weight: 450,
    servings: 6,
    nutritional_values: { calories: 350, carbs: 38, fat: 17, protein: 5, sugar: 25 },
    special_notes: "Fără zahăr, gluten sau lactate. 100% plant-based.",
    storage_conditions: "A se păstra la frigider",
    expiry_date: "7 zile de la livrare",
    availability: "disponibil",
    tags: ["cadou", "vegan", "fără zahăr", "raw"]
  },
  {
    name: "Cutie Corporate – Sweet Office",
    description: "Pachet elegant pentru echipe sau colaboratori: mini-prăjituri, biscuiți personalizați și bomboane asortate.",
    category: "cadouri",
    subcategory: "corporate",
    price: 140,
    image: "https://i.imgur.com/KZTQei1.jpg",
    allergens: ["gluten", "lapte", "ouă", "nuci"],
    ingredients: ["Făină", "Unt", "Nuci", "Ouă", "Zahăr", "Cacao", "Vanilie"],
    weight: 750,
    servings: 10,
    nutritional_values: { calories: 420, carbs: 52, fat: 20, protein: 4, sugar: 32 },
    special_notes: "Include opțiune de personalizare logo.",
    storage_conditions: "A se păstra la rece",
    expiry_date: "12 zile de la livrare",
    availability: "disponibil",
    tags: ["cadou", "corporate", "echipă", "business"]
  },
  {
    name: "Cutie Romantică – Două Inimi",
    description: "Cutie elegantă cu inimioare din ciocolată, trufe și praline, perfectă pentru cupluri.",
    category: "cadouri",
    subcategory: "romantic",
    price: 110,
    image: "https://i.imgur.com/w3WSMLM.jpg",
    allergens: ["lapte", "nuci"],
    ingredients: ["Ciocolată cu lapte", "Migdale", "Unt", "Frișcă", "Zahăr", "Rom"],
    weight: 400,
    servings: 4,
    nutritional_values: { calories: 430, carbs: 48, fat: 22, protein: 4, sugar: 36 },
    special_notes: "Ambalaj premium, include mesaj personalizat.",
    storage_conditions: "A se păstra la loc răcoros și uscat",
    expiry_date: "10 zile de la livrare",
    availability: "disponibil",
    tags: ["cadou", "romantic", "valentine", "cuplu"]
  },
  {
    name: "Surpriză Dulce pentru Copii",
    description: "O cutie veselă cu mini-brioșe, biscuiți cu ciocolată și acadele artizanale, special creată pentru cei mici.",
    category: "cadouri",
    subcategory: "copii",
    price: 85,
    image: "https://i.imgur.com/CtzlbBb.jpg",
    allergens: ["gluten", "lapte", "ouă"],
    ingredients: ["Făină", "Ouă", "Zahăr", "Lapte", "Ciocolată", "Coloranți naturali"],
    weight: 500,
    servings: 6,
    nutritional_values: { calories: 390, carbs: 55, fat: 16, protein: 3, sugar: 34 },
    special_notes: "Ambalaj colorat, sigur pentru copii peste 3 ani.",
    storage_conditions: "A se păstra într-un loc uscat",
    expiry_date: "7 zile de la livrare",
    availability: "disponibil",
    tags: ["cadou", "copii", "colorat", "vesel"]
  }
];

  
  
  
  // Parcurgem fiecare produs pentru a genera un id unic și pentru a-l adăuga în colecția "products"
  for (const product of newProducts) {
    let prefix = "";
    // Se stabilește prefixul în funcție de subcategorie
    if (product.subcategory.toLowerCase().includes("ecler")) {
      prefix = "ecler";
    } else if (product.subcategory.toLowerCase().includes("biscuiti")) {
      prefix = "biscuiti";
    } else {
      prefix = product.category.toLowerCase().replace(/\s+/g, "");
    }

    // Obținem următorul număr disponibil pentru prefixul respectiv
    const nextId = await getNextId(prefix);
    product.id = `${prefix}-${nextId}`;

    // Adăugăm produsul în colecția "products"
    await db.collection("products").doc(product.id).set(product);
    console.log(`Produsul "${product.name}" a fost adăugat cu id ${product.id}`);
  }

  console.log("Toate noile produse au fost adăugate cu succes!");
}

addNewProducts().catch(console.error);