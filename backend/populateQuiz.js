const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const questions = [
  {
    id: "q1",
    question: "Ce arome preferi de obicei într-un desert?",
    options: [
      { id: "q1a", text: "Ciocolată intensă", tags: ["ciocolata", "dulce", "intens"], nextQuestion: "q2" },
      { id: "q1b", text: "Fructe proaspete și acrișoare", tags: ["fructe", "fresh", "acrisor"], nextQuestion: "q3" },
      { id: "q1c", text: "Vanilie și creme fine", tags: ["vanilie", "cremos", "fin"], nextQuestion: "q2" },
      { id: "q1d", text: "Caramel sărat sau nuci", tags: ["caramel", "nuci", "saraturi"], nextQuestion: "q4" },
    ]
  },
  {
    id: "q2",
    question: "Ce textură te atrage cel mai mult la deserturi?",
    options: [
      { id: "q2a", text: "Cremă catifelată", tags: ["cremos", "catifelat"], nextQuestion: "q5" },
      { id: "q2b", text: "Blat pufos și ușor", tags: ["pufos", "light"], nextQuestion: "q5" },
      { id: "q2c", text: "Textură densă și bogată", tags: ["dens", "bogat"], nextQuestion: "q5" },
    ]
  },
  {
    id: "q3",
    question: "Ce fructe preferi să regăsești într-un desert?",
    options: [
      { id: "q3a", text: "Fructe de pădure", tags: ["fructe_padure", "fresh"], nextQuestion: "q5" },
      { id: "q3b", text: "Citrice și exotice", tags: ["citrice", "exotic"], nextQuestion: "q5" },
      { id: "q3c", text: "Mere, pere sau prune", tags: ["mere_pere", "clasic"], nextQuestion: "q5" },
    ]
  },
  {
    id: "q4",
    question: "Îți plac deserturile cu influențe mai aparte?",
    options: [
      { id: "q4a", text: "Da, arome orientale (fistic, trandafir)", tags: ["oriental", "sofisticat"], nextQuestion: "q5" },
      { id: "q4b", text: "Da, combinații sărate și dulci", tags: ["dulce_sarat", "sofisticat"], nextQuestion: "q5" },
      { id: "q4c", text: "Nu, prefer arome clasice și simple", tags: ["clasic", "simplu"], nextQuestion: "q5" },
    ]
  },
  {
    id: "q5",
    question: "Care dintre aceste stiluri de deserturi îți place cel mai mult?",
    options: [
      { id: "q5a", text: "Deserturi franțuzești clasice, elegante (ex: Millefeuille, Éclair)", tags: ["francez", "clasic", "elegant", "cremos"], nextQuestion: null },
      { id: "q5b", text: "Deserturi moderne și inovative (ex: mousse-uri, deserturi minimaliste)", tags: ["modern", "inovativ", "light"], nextQuestion: null },
      { id: "q5c", text: "Deserturi tradiționale, rețete autentice (ex: plăcinte clasice, torturi rustice)", tags: ["traditional", "rustic", "autentic"], nextQuestion: null },
    ]
  }
];

async function populateQuizQuestions() {
  for (const question of questions) {
    const questionRef = db.collection("quizQuestions").doc(question.id);

    await questionRef.set({
      id: question.id,
      question: question.question,
      options: question.options
    });

    console.log(`✔️ Întrebarea "${question.id}" a fost adăugată.`);
  }

  console.log("✅ Toate întrebările quiz-ului au fost adăugate cu succes!");
}

populateQuizQuestions().catch(console.error);