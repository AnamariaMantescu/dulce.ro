// updateImageUrls.js
const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

// Real image URLs from Unsplash (free stock images)
const imageUrls = {
  // Categories
  "torturi": "https://images.unsplash.com/photo-1578985545062-69928b1d9587?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
  "prajituri": "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
  "specialitati": "https://images.unsplash.com/photo-1542826438-bd32f43d626f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
  "cadouri": "https://images.unsplash.com/photo-1562777717-dc6984f65a63?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
  
  // Products
  "url_tarta_fructe.jpg": "https://images.unsplash.com/photo-1519915028121-7d3463d5b1ff?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
  "url_ecler_ciocolata.jpg": "https://images.unsplash.com/photo-1551024506-0bccd828d307?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
  "url_fara_zahar.jpg": "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
  "url_post_cacao.jpg": "https://images.unsplash.com/photo-1606890658317-7d14490b76fd?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
  
  // Themes
  "url_italian_week.jpg": "https://images.unsplash.com/photo-1551183053-bf91a1d81141?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
  "url_italian_banner.jpg": "https://images.unsplash.com/photo-1470124182917-cc6e71b22ecc?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80",
  "url_italian1.jpg": "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
  "url_italian2.jpg": "https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
  "url_italian3.jpg": "https://images.unsplash.com/photo-1571115177098-24ec42ed204d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
  
  // French week
  "url_french_week.jpg": "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
  "url_french_banner.jpg": "https://images.unsplash.com/photo-1464195244916-405fa0a8763d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80",
  "url_french1.jpg": "https://images.unsplash.com/photo-1623334044303-241021148842?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
  "url_french2.jpg": "https://images.unsplash.com/photo-1550617931-e17a7b70dce2?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
  "url_french3.jpg": "https://images.unsplash.com/photo-1470124182917-cc6e71b22ecc?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
  
  // Turkish week
  "url_turkish_week.jpg": "https://images.unsplash.com/photo-1599999904408-9e1baf634345?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
  "url_turkish_banner.jpg": "https://images.unsplash.com/photo-1530189755474-b84b52013b31?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80",
  "url_turkish1.jpg": "https://images.unsplash.com/photo-1583743089695-4b816a7b6f77?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
  "url_turkish2.jpg": "https://images.unsplash.com/photo-1625498542602-6faf30fa1d0a?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
  "url_turkish3.jpg": "https://images.unsplash.com/photo-1583743089695-4b816a7b6f77?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
  
  // Cake elements
  "url_blat_vanilie.jpg": "https://images.unsplash.com/photo-1486427944299-d1955d23e34d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
  "url_blat_ciocolata.jpg": "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
  "url_blat_redvelvet.jpg": "https://images.unsplash.com/photo-1614707267537-b85aaf00c4b7?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
  "url_blat_fara_gluten.jpg": "https://images.unsplash.com/photo-1621303837174-89787a7d4729?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
  "url_blat_fructe.jpg": "https://images.unsplash.com/photo-1565958011703-44f9829ba187?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
  
  // Creams
  "url_crema_vanilie.jpg": "https://images.unsplash.com/photo-1530648672449-81f6c723e2f1?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
  "url_crema_ciocolata.jpg": "https://images.unsplash.com/photo-1511381939415-e44015466834?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
  "url_crema_fructe.jpg": "https://images.unsplash.com/photo-1563805042-7684c019e1cb?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
  "url_crema_caramel.jpg": "https://images.unsplash.com/photo-1541599188900-695c3d989c05?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
  "url_crema_mascarpone.jpg": "https://images.unsplash.com/photo-1519869325930-281384150729?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
  
  // Toppings
  "url_topping_ciocolata.jpg": "https://images.unsplash.com/photo-1606312619070-d48b4c652a52?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
  "url_topping_fructe.jpg": "https://images.unsplash.com/photo-1565958011703-44f9829ba187?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
  "url_topping_caramel.jpg": "https://images.unsplash.com/photo-1559598467-f8b76c8155d0?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
  "url_topping_fondant.jpg": "https://images.unsplash.com/photo-1562440499-64c9a111f713?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
  
  // Decorations
  "url_decor_flori.jpg": "https://images.unsplash.com/photo-1596994836684-49a21ce35b3d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
  "url_decor_figurine.jpg": "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
  "url_decor_ciocolata.jpg": "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
  "url_decor_auriu.jpg": "https://images.unsplash.com/photo-1562440499-64c9a111f713?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
  
  // Sizes
  "url_marime_mica.jpg": "https://images.unsplash.com/photo-1578985545062-69928b1d9587?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
  "url_marime_medie.jpg": "https://images.unsplash.com/photo-1562777717-dc6984f65a63?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
  "url_marime_mare.jpg": "https://images.unsplash.com/photo-1535141192574-5d4897c12636?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
  "url_marime_xl.jpg": "https://images.unsplash.com/photo-1562777717-dc6984f65a63?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
  
  // Special days
  "url_cookie_day.jpg": "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
  "url_cookie_banner.jpg": "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80",
  "url_cheesecake_day.jpg": "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
  "url_cheesecake_banner.jpg": "https://images.unsplash.com/photo-1524351199678-941a58a3df50?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80",
  "url_macaron_day.jpg": "https://images.unsplash.com/photo-1569864358642-9d1684040f43?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
  "url_macaron_banner.jpg": "https://images.unsplash.com/photo-1528975604071-b4dc52a2d18c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80"
};

// Function to replace placeholder URLs with real image URLs
function replaceImageUrl(data) {
  if (!data) return data;
  
  // If data is an array, process each item
  if (Array.isArray(data)) {
    return data.map(item => replaceImageUrl(item));
  }
  
  // If data is an object, process each property
  if (typeof data === 'object') {
    const newData = { ...data };
    
    // Process image URLs
    if (newData.image && typeof newData.image === 'string' && imageUrls[newData.image]) {
      newData.image = imageUrls[newData.image];
    } else if (newData.imageUrl && typeof newData.imageUrl === 'string' && imageUrls[newData.imageUrl]) {
      newData.imageUrl = imageUrls[newData.imageUrl];
    }
    
    // Process gallery arrays
    if (newData.gallery && Array.isArray(newData.gallery)) {
      newData.gallery = newData.gallery.map(url => {
        if (typeof url === 'string' && imageUrls[url]) {
          return imageUrls[url];
        }
        return url;
      });
    }
    
    // Process banner
    if (newData.banner && typeof newData.banner === 'string' && imageUrls[newData.banner]) {
      newData.banner = imageUrls[newData.banner];
    }
    
    // Process nested objects
    for (const key in newData) {
      if (typeof newData[key] === 'object') {
        newData[key] = replaceImageUrl(newData[key]);
      }
    }
    
    return newData;
  }
  
  return data;
}

// Update collections with real image URLs
async function updateImageUrls() {
  try {
    // Update categories
    const categoriesSnapshot = await db.collection('categories').get();
    for (const doc of categoriesSnapshot.docs) {
      const data = doc.data();
      const updatedData = replaceImageUrl(data);
      await db.collection('categories').doc(doc.id).update(updatedData);
    }
    console.log('Categories updated with real image URLs');
    
    // Update products
    const productsSnapshot = await db.collection('products').get();
    for (const doc of productsSnapshot.docs) {
      const data = doc.data();
      const updatedData = replaceImageUrl(data);
      await db.collection('products').doc(doc.id).update(updatedData);
    }
    console.log('Products updated with real image URLs');
    
    // Update themes
    const themesSnapshot = await db.collection('themes').get();
    for (const doc of themesSnapshot.docs) {
      const data = doc.data();
      const updatedData = replaceImageUrl(data);
      await db.collection('themes').doc(doc.id).update(updatedData);
    }
    console.log('Themes updated with real image URLs');
    
    // Update cake elements
    const cakeElementsCollections = ['blat', 'crema', 'topping', 'decoratiuni', 'marimi'];
    for (const subCollection of cakeElementsCollections) {
      try {
        const snapshot = await db.collection('cakeElements').doc(subCollection).collection('items').get();
        for (const doc of snapshot.docs) {
          const data = doc.data();
          const updatedData = replaceImageUrl(data);
          await db.collection('cakeElements').doc(subCollection).collection('items').doc(doc.id).update(updatedData);
        }
        console.log(`Cake elements (${subCollection}) updated with real image URLs`);
      } catch (error) {
        console.error(`Error updating ${subCollection}:`, error);
      }
    }
    
    // Update special days
    const specialDaysSnapshot = await db.collection('specialDays').get();
    for (const doc of specialDaysSnapshot.docs) {
      const data = doc.data();
      const updatedData = replaceImageUrl(data);
      await db.collection('specialDays').doc(doc.id).update(updatedData);
    }
    console.log('Special days updated with real image URLs');
    
    console.log('All image URLs have been updated successfully!');
  } catch (error) {
    console.error('Error updating image URLs:', error);
  }
}

// Run the update function
updateImageUrls().catch(console.error);
