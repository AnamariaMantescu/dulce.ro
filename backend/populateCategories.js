const admin = require("firebase-admin");

const serviceAccount = require("./serviceAccountKey.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function populateCategories() {
  const categories = [
    {
      id: "torturi",
      name: "Torturi",
      description: "Torturi artizanale delicioase pentru orice ocazie.",
      image: "https://example.com/torturi.jpg",
      link: "/products?torturi",
      visible: true
    },
    {
      id: "prajituri",
      name: "Prăjituri",
      description: "Gusturi fine, ingrediente naturale.",
      image: "https://example.com/prajituri.jpg",
      link: "/products?prajituri",
      visible: true
    },
    {
      id: "cadouri",
      name: "Cadouri",
      description: "Cutii cadou personalizabile.",
      image: "https://example.com/cadouri.jpg",
      link: "/gift-boxes",
      visible: true
    },
    {
        id: "speciale",
        name: "Prăjituri speciale",
        description: "Prăjituri fără zahăr, gluten, de post.",
        image: "https://example.com/cadouri.jpg",
        link: "/products?speciale",
        visible: true
      },
    {
      id: "saptamana-tematica",
      name: "Săptămâna Franceză",
      description: "Săptămâna dedicată patiseriei franțuzești!",
      image: "https://example.com/saptamana-franceza.jpg",
      link: "/themes/french-week",
      visible: false // Adminul o poate activa din dashboard
    },
    {
      id: "ziua-prajiturii",
      name: "Ziua Biscuiților cu Ciocolată",
      description: "Promoții speciale doar azi!",
      image: "https://example.com/ziua-biscuitilor.jpg",
      link: "/special-day",
      visible: false // Momentan inactiv
    }
  ];

  for (const category of categories) {
    await db.collection("categories").doc(category.id).set(category);
  }

  console.log("Colecția 'categories' a fost populată cu succes!");
}

populateCategories()
  .then(() => process.exit())
  .catch((error) => {
    console.error("Eroare la popularea colecției 'categories':", error);
    process.exit(1);
  });
