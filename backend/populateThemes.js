const admin = require("firebase-admin");

// Inițializare Firebase Admin SDK
const serviceAccount = require("./serviceAccountKey.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function populateThemes() {
  const themes = [
    {
      id: "french-week",
      name: "Săptămâna Franțuzească",
      start_date: "2025-03-10",
      end_date: "2025-03-16",
      products: ["cake-1", "cake-2"],
      description: "Savurează deserturi franțuzești autentice!",
      image: "url_french_week.jpg",
      active: false
    },
    {
      id: "italian-week",
      name: "Săptămâna Italienească",
      start_date: "2025-04-05",
      end_date: "2025-04-12",
      products: ["cake-1"],
      description: "Săptămâna perfectă pentru iubitorii de tiramisu și panna cotta.",
      image: "url_chocolate_week.jpg",
      active: true
    }
  ];

  for (const theme of themes) {
    await db.collection("themes").doc(theme.id).set(theme);
  }

  console.log("Colecția 'themes' a fost populată cu succes!");
}

// Rulează funcția
populateThemes()
  .then(() => process.exit())
  .catch((error) => {
    console.error("Eroare la popularea bazei de date:", error);
    process.exit(1);
  });
