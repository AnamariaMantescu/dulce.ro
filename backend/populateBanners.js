const admin = require("firebase-admin");

// Inițializare Firebase Admin SDK
const serviceAccount = require("./serviceAccountKey.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function populateBanners() {
  const banner = {
    id: "main-banner",
    title: "Descoperă magia deserturilor artizanale!",
    subtitle: "Comandă tortul perfect sau creează-l pe al tău!",
    images: [
      "https://example.com/image1.jpg",
      "https://example.com/image2.jpg",
      "https://example.com/image3.jpg",
      "https://example.com/image4.jpg"
    ],
    layout: "grid",
    buttonText: "Construiește-ți tortul",
    buttonLink: "/custom-cake"
  };

  await db.collection("banners").doc("main-banner").set(banner);
  console.log("Colecția 'banners' a fost populată cu succes!");
}

populateBanners()
  .then(() => process.exit())
  .catch((error) => {
    console.error("Eroare la popularea colecției 'banners':", error);
    process.exit(1);
  });
