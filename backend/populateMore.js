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
      name: "Tort Diplomat",
      description: "Un desert răcoritor cu cremă fină de vanilie, frișcă naturală și fructe confiate, totul între straturi ușoare de pișcoturi. Gust echilibrat, lejer și mereu apreciat la mesele festive.",
      category: "torturi",
      subcategory: "diplomat",
      price: 120,
      image: "https://exemplu.com/tort_diplomat.jpg",
      allergens: ["lapte", "ouă", "gluten"],
      ingredients: ["Pișcoturi", "Ouă", "Lapte", "Zahăr", "Frișcă", "Fructe confiate", "Gelatină"],
      weight: 1300,
      servings: 10,
      nutritional_values: { calories: 380, fat: 20, carbs: 36, protein: 5, sugar: 26 },
      special_notes: "Ideal pentru aniversări și sărbători.",
      storage_conditions: "A se păstra la frigider",
      expiry_date: "3 zile de la livrare",
      availability: "disponibil",
      tags: ["tort", "diplomat", "fructe", "clasic"]
    },
    {
      name: "Tort Amandină",
      description: "Un tort bogat în ciocolată cu blat însiropat, cremă de cacao și glazură lucioasă de fondant. Gust intens și nostalgic, exact cum îl știi din copilărie.",
      category: "torturi",
      subcategory: "amandină",
      price: 130,
      image: "https://exemplu.com/tort_amandina.jpg",
      allergens: ["gluten", "lapte", "ouă"],
      ingredients: ["Făină", "Ouă", "Cacao", "Zahăr", "Unt", "Fondant", "Rom"],
      weight: 1300,
      servings: 10,
      nutritional_values: { calories: 450, fat: 28, carbs: 40, protein: 6, sugar: 32 },
      special_notes: "Preferatul cofetarilor tradiționali.",
      storage_conditions: "A se păstra la frigider",
      expiry_date: "3 zile de la livrare",
      availability: "disponibil",
      tags: ["tort", "amandină", "ciocolată", "rom", "clasic"]
    },
    {
      name: "Tort Joffre",
      description: "Un tort sofisticat cu blat de cacao și cremă ganache fină, inventat în onoarea mareșalului Joffre. Textură densă, gust rafinat și ciocolată din plin.",
      category: "torturi",
      subcategory: "joffre",
      price: 140,
      image: "https://exemplu.com/tort_joffre.jpg",
      allergens: ["gluten", "lapte", "ouă"],
      ingredients: ["Ouă", "Zahăr", "Ciocolată neagră", "Frișcă", "Făină"],
      weight: 1200,
      servings: 8,
      nutritional_values: { calories: 460, fat: 30, carbs: 35, protein: 5, sugar: 28 },
      special_notes: "Un tort cu istorie și eleganță.",
      storage_conditions: "A se păstra la frigider",
      expiry_date: "3 zile de la livrare",
      availability: "disponibil",
      tags: ["tort", "joffre", "ciocolată", "elegant"]
    },
    {
      name: "Tort Esterházy",
      description: "Un desert nobil din bucătăria austro-ungară, cu straturi fine de bezea cu nucă și cremă de unt cu vanilie. Gust bogat și aspect inconfundabil.",
      category: "torturi",
      subcategory: "esterhazy",
      price: 145,
      image: "https://exemplu.com/tort_esterhazy.jpg",
      allergens: ["nuci", "lapte", "ouă"],
      ingredients: ["Nuci", "Ouă", "Unt", "Zahăr", "Lapte", "Vanilie"],
      weight: 1300,
      servings: 10,
      nutritional_values: { calories: 440, fat: 28, carbs: 36, protein: 6, sugar: 30 },
      special_notes: "Răsfăț imperial cu tradiție.",
      storage_conditions: "A se păstra la frigider",
      expiry_date: "3 zile de la livrare",
      availability: "disponibil",
      tags: ["tort", "esterhazy", "nuci", "clasic"]
    },
    {
      name: "Tort Sacher",
      description: "Clasic vienez: blat de ciocolată dens, gem de caise și glazură de ciocolată neagră. Simplu, dar extrem de savuros.",
      category: "torturi",
      subcategory: "sacher",
      price: 135,
      image: "https://exemplu.com/tort_sacher.jpg",
      allergens: ["gluten", "lapte", "ouă"],
      ingredients: ["Ciocolată neagră", "Ouă", "Gem de caise", "Făină", "Unt", "Zahăr"],
      weight: 1200,
      servings: 8,
      nutritional_values: { calories: 430, fat: 25, carbs: 37, protein: 5, sugar: 29 },
      special_notes: "Un tort nobil, perfect cu un espresso.",
      storage_conditions: "A se păstra la frigider",
      expiry_date: "3 zile de la livrare",
      availability: "disponibil",
      tags: ["tort", "sacher", "caise", "vienez"]
    },
    {
      name: "Tort Krantz",
      description: "Bezea cu nucă, cremă de unt vanilată și topping crocant de zahăr ars cu nuci. Texturi contrastante și gust clasic românesc.",
      category: "torturi",
      subcategory: "krantz",
      price: 130,
      image: "https://exemplu.com/tort_krantz.jpg",
      allergens: ["nuci", "lapte", "ouă"],
      ingredients: ["Nuci", "Ouă", "Zahăr", "Unt", "Vanilie"],
      weight: 1200,
      servings: 8,
      nutritional_values: { calories: 420, fat: 26, carbs: 34, protein: 5, sugar: 27 },
      special_notes: "Crocant la exterior, fin la interior.",
      storage_conditions: "A se păstra la frigider",
      expiry_date: "3 zile de la livrare",
      availability: "disponibil",
      tags: ["tort", "krantz", "nuci", "caramel"]
    },
    {
      name: "Tort cu mere caramelizate",
      description: "Blaturi pufoase, mere coapte și caramel, într-o combinație clasică și reconfortantă. Gust de toamnă, perfect pentru serile în familie.",
      category: "torturi",
      subcategory: "mere",
      price: 125,
      image: "https://exemplu.com/tort_mere_caramel.jpg",
      allergens: ["gluten", "lapte", "ouă"],
      ingredients: ["Mere", "Zahăr", "Ouă", "Făină", "Unt", "Scorțișoară"],
      weight: 1300,
      servings: 10,
      nutritional_values: { calories: 410, fat: 22, carbs: 39, protein: 5, sugar: 28 },
      special_notes: "Aroma de scorțișoară te va cuceri imediat.",
      storage_conditions: "A se păstra la frigider",
      expiry_date: "3 zile de la livrare",
      availability: "disponibil",
      tags: ["tort", "mere", "caramel", "scorțișoară"]
    },
    {
      name: "Tort cu nucă și cafea",
      description: "Un tort cu blat de nucă și cremă de cafea, intens și reconfortant. Ideal pentru iubitorii de arome puternice și tradiționale.",
      category: "torturi",
      subcategory: "cafea",
      price: 130,
      image: "https://exemplu.com/tort_nuca_cafea.jpg",
      allergens: ["nuci", "lapte", "ouă"],
      ingredients: ["Nuci", "Ouă", "Zahăr", "Cafea", "Unt"],
      weight: 1300,
      servings: 10,
      nutritional_values: { calories: 430, fat: 27, carbs: 36, protein: 6, sugar: 29 },
      special_notes: "Aroma intensă de cafea învăluie tot desertul.",
      storage_conditions: "A se păstra la frigider",
      expiry_date: "3 zile de la livrare",
      availability: "disponibil",
      tags: ["tort", "cafea", "nuci", "clasic"]
    },
    {
      name: "Tort Foret Noire (Pădurea Neagră)",
      description: "Blaturi de cacao însiropate, vișine și frișcă naturală. Un tort german faimos pentru echilibrul perfect între ciocolată și fructe.",
      category: "torturi",
      subcategory: "foret noire",
      price: 140,
      image: "https://exemplu.com/tort_foret_noire.jpg",
      allergens: ["gluten", "lapte", "ouă"],
      ingredients: ["Ciocolată", "Vișine", "Frișcă", "Ouă", "Zahăr", "Făină"],
      weight: 1300,
      servings: 10,
      nutritional_values: { calories: 430, fat: 25, carbs: 38, protein: 5, sugar: 28 },
      special_notes: "Un clasic internațional, cu gust memorabil.",
      storage_conditions: "A se păstra la frigider",
      expiry_date: "3 zile de la livrare",
      availability: "disponibil",
      tags: ["tort", "visine", "cacao", "clasic"]
    },
    {
      name: "Tort cu cremă de vanilie și fructe proaspete",
      description: "Un tort aerat, cu cremă de vanilie și decor generos de fructe proaspete. Gust lejer, potrivit pentru orice anotimp.",
      category: "torturi",
      subcategory: "fructe",
      price: 125,
      image: "https://exemplu.com/tort_vanilie_fructe.jpg",
      allergens: ["gluten", "lapte", "ouă"],
      ingredients: ["Făină", "Zahăr", "Ouă", "Lapte", "Vanilie", "Fructe proaspete"],
      weight: 1300,
      servings: 10,
      nutritional_values: { calories: 400, fat: 20, carbs: 38, protein: 5, sugar: 26 },
      special_notes: "Ideal pentru zilele calde și evenimente festive.",
      storage_conditions: "A se păstra la frigider",
      expiry_date: "3 zile de la livrare",
      availability: "disponibil",
      tags: ["tort", "fructe", "vanilie", "clasic"]
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
