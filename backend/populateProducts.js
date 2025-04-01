const admin = require("firebase-admin");

// Inițializare Firebase Admin SDK
const serviceAccount = require("./serviceAccountKey.json"); // Înlocuiește cu fișierul tău JSON descărcat din Firebase
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function populateProducts() {
  const products = [
    {
      id: "cake-1",
      name: "Tort Red Velvet",
      category: "tort",
      price: 135,
      description: "Un tort clasic cu blat pufos roșu și cremă de mascarpone.",
      image: "url_tort_redvelvet.jpg",
      tags: ["red velvet", "festiv", "fără conservanți"],
      availability: "disponibil",
      ingredients: ["Făină", "Zahăr", "Ouă", "Unt", "Cacao", "Colorant natural", "Mascarpone", "Vanilie"],
      nutritional_values: {
        calories: 320,
        protein: 5,
        carbs: 45,
        sugar: 30,
        fat: 12
      },
      allergens: ["gluten", "lapte", "ouă"],
      weight: 1000,
      servings: 8,
      storage_conditions: "A se păstra la frigider la 4°C",
      expiry_date: "5 zile de la livrare",
      special_notes: "Poate conține urme de nuci."
    },
    {
      id: "cake-2",
      name: "Tort Ciocolată Intens",
      category: "tort",
      price: 120,
      description: "Un tort decadent cu ciocolată belgiană și cremă fină.",
      image: "url_tort_ciocolata.jpg",
      tags: ["ciocolată", "clasic", "lux"],
      availability: "disponibil",
      ingredients: ["Făină", "Zahăr", "Ouă", "Ciocolată Neagră 70%", "Frișcă", "Unt", "Vanilie"],
      nutritional_values: {
        calories: 350,
        protein: 6,
        carbs: 40,
        sugar: 28,
        fat: 15
      },
      allergens: ["gluten", "lapte", "ouă"],
      weight: 1200,
      servings: 10,
      storage_conditions: "A se păstra la frigider la 4°C",
      expiry_date: "5 zile de la livrare",
      special_notes: "Nu conține conservanți."
    },
    {
      id: "gift-box-1",
      name: "Cutie Cadou Premium",
      category: "gift-box",
      price: 200,
      description: "O selecție de praline fine și macarons delicioase.",
      image: "url_cutie_cadou.jpg",
      tags: ["cadou", "lux", "exclusiv"],
      availability: "disponibil",
      ingredients: ["Ciocolată Belgiană", "Alune de Pădure", "Migdală", "Zahăr", "Frișcă"],
      nutritional_values: {
        calories: 400,
        protein: 4,
        carbs: 50,
        sugar: 35,
        fat: 18
      },
      allergens: ["gluten", "lapte", "nuci"],
      weight: 500,
      servings: 6,
      storage_conditions: "A se păstra la loc răcoros și uscat",
      expiry_date: "15 zile de la livrare",
      special_notes: "Conține nuci și poate avea urme de soia."
    }
  ];

  for (const product of products) {
    await db.collection("products").doc(product.id).set(product);
  }

  console.log("Colecția 'products' a fost populată cu succes!");
}

// Rulează funcția
populateProducts()
  .then(() => process.exit())
  .catch((error) => {
    console.error("Eroare la popularea bazei de date:", error);
    process.exit(1);
  });
