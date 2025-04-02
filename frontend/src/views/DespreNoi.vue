<template>
    <div class="about-page">
      <!-- Header cu background din baza de date -->
      <div class="video-header" :style="{ backgroundImage: `url(${aboutImages['poza-fata'] ? aboutImages['poza-fata'].image : ''})` }">
        <div class="overlay"></div>
        <div class="header-content">
          <h1 class="main-title">DULCE</h1>
          <p class="tagline">Arta cofetăriei transformată în experiențe memorabile</p>
        </div>
      </div>
  
      <!-- Secțiunea Povestea Noastră -->
      <section class="story-section">
        <div class="container">
          <div class="section-title">
            <span class="subtitle">Descoperă</span>
            <h2>Povestea Noastră</h2>
          </div>
          <div class="story-content">
            <div class="story-text">
              <p class="highlight">Din 2015, creăm cu pasiune deserturi care aduc zâmbete și bucurie</p>
              <p>
                DULCE a început ca un vis al unei pasionate de cofetărie, transformându-se rapid într-un spațiu magic unde arta culinară întâlnește inovația. Echipa noastră de maeștri cofetari combină tehnicile tradiționale cu idei moderne, creând deserturi care nu sunt doar delicioase, ci și adevărate opere de artă.
              </p>
              <p>
                Fiecare produs care iese din laboratorul nostru poartă amprenta pasiunii și devotamentului nostru pentru calitate și gust desăvârșit. Suntem mai mult decât o cofetărie - suntem creatorii momentelor dulci din viața dumneavoastră.
              </p>
            </div>
            <div class="story-image">
              <div class="image-container">
                <img :src="aboutImages['poza-barbati'] ? aboutImages['poza-barbati'].image : ''" alt="Echipa DULCE" class="parallax-image">
              </div>
            </div>
          </div>
        </div>
      </section>
  
      <!-- Secțiunea Procesul Nostru - cu timeline -->
      <section class="process-section">
        <div class="container">
          <div class="section-title centered">
            <span class="subtitle">Meșteșug</span>
            <h2>Cum creăm magia dulce</h2>
          </div>
          <div class="timeline">
            <div class="timeline-item">
              <div class="timeline-icon">
                <img :src="aboutImages['gif-biscuiti'] ? aboutImages['gif-biscuiti'].image : ''" alt="Selecția ingredientelor" class="timeline-gif">
              </div>
              <div class="timeline-content">
                <h3>Selecția ingredientelor</h3>
                <p>Alegem cu grijă cele mai proaspete și autentice ingrediente de la furnizori premium locali și internaționali.</p>
              </div>
            </div>
            <div class="timeline-item">
              <div class="timeline-icon">
                <img :src="aboutImages['gif-crema'] ? aboutImages['gif-crema'].image : ''" alt="Perfecționarea rețetelor" class="timeline-gif">
              </div>
              <div class="timeline-content">
                <h3>Perfecționarea rețetelor</h3>
                <p>Testăm și rafinăm constant rețetele noastre pentru a obține gustul și textura perfectă de fiecare dată.</p>
              </div>
            </div>
            <div class="timeline-item">
              <div class="timeline-icon">
                <img :src="aboutImages['gif-zahar'] ? aboutImages['gif-zahar'].image : ''" alt="Zahar pudra" class="timeline-gif">
              </div>
              <div class="timeline-content">
                <h3>Crearea artizanală</h3>
                <p>Fiecare desert este creat manual cu atenție la cele mai mici detalii de către cofetarii noștri pasionați.</p>
              </div>
            </div>
            <div class="timeline-item">
              <div class="timeline-icon">
                <img :src="aboutImages['ecler-gif'] ? aboutImages['ecler-gif'].image : ''" alt="Controlul calității" class="timeline-gif">
              </div>
              <div class="timeline-content">
                <h3>Controlul calității</h3>
                <p>Verificăm cu atenție fiecare produs pentru a ne asigura că respectă standardele noastre înalte înainte de a ajunge la clienți.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
  
      <!-- Secțiunea Valorile Noastre - cu carduri animate -->
      <section class="values-section">
        <div class="container">
          <div class="section-title">
            <span class="subtitle">Ce ne definește</span>
            <h2>Valorile Noastre</h2>
          </div>
          <div class="values-grid">
            <div class="value-card">
              <div class="value-icon">
                <img :src="aboutImages['ingrediente'] ? aboutImages['ingrediente'].image : ''" alt="Calitate" class="icon-gif">
              </div>
              <h3>Calitate</h3>
              <p>Folosim ingrediente premium și tehnici meșteșugărești pentru rezultate excepționale.</p>
            </div>
            <div class="value-card">
              <div class="value-icon">
                <img :src="aboutImages['inovatie'] ? aboutImages['inovatie'].image : ''" alt="Inovație" class="icon-gif">
              </div>
              <h3>Inovație</h3>
              <p>Explorăm constant noi teritorii ale artei cofetăriei pentru a vă surprinde mereu.</p>
            </div>
            <div class="value-card">
              <div class="value-icon">
                <img :src="aboutImages['pasiune'] ? aboutImages['pasiune'].image : ''" alt="Pasiune" class="icon-gif">
              </div>
              <h3>Pasiune</h3>
              <p>Punem dragoste în fiecare desert, făcând din pasiunea noastră bucuria voastră.</p>
            </div>
            <div class="value-card">
              <div class="value-icon">
                <img :src="aboutImages['excelenta'] ? aboutImages['excelenta'].image : ''" alt="Excelență" class="icon-gif">
              </div>
              <h3>Excelență</h3>
              <p>Nu facem compromisuri când vine vorba de gustul și aspectul creațiilor noastre.</p>
            </div>
          </div>
        </div>
      </section>
  
      <!-- Galerie foto/video cu produse și laboratorul -->
      <section class="gallery-section">
        <div class="container">
          <div class="section-title centered">
            <span class="subtitle">Privește</span>
          </div>
          <div class="gallery-grid">
            <div class="gallery-item large">
              <img :src="aboutImages['poza-vitrina'] ? aboutImages['poza-vitrina'].image : ''" alt="Vitrina DULCE">
              <div class="gallery-overlay">
                <div class="overlay-content">
                </div>
              </div>
            </div>
            <div class="gallery-item">
              <img :src="aboutImages['poza-fata'] ? aboutImages['poza-fata'].image : ''" alt="Prăjituri DULCE">
              <div class="gallery-overlay">
                <div class="overlay-content">
                </div>
              </div>
            </div>
            <div class="gallery-item">
              <img :src="aboutImages['gif-biscuiti'] ? aboutImages['gif-biscuiti'].image : ''" alt="Biscuiți DULCE">
              <div class="gallery-overlay">
                <div class="overlay-content">
                </div>
              </div>
            </div>
            <div class="gallery-item">
              <img :src="aboutImages['gif-crema'] ? aboutImages['gif-crema'].image : ''" alt="Cadouri DULCE">
              <div class="gallery-overlay">
                <div class="overlay-content">
                </div>
              </div>
            </div>
            <div class="gallery-item">
              <img :src="aboutImages['poza-barbati'] ? aboutImages['poza-barbati'].image : ''" alt="Echipa DULCE">
              <div class="gallery-overlay">
                <div class="overlay-content">
                </div>
              </div>
            </div>
            <div class="gallery-item">
              <img :src="aboutImages['ingrediente'] ? aboutImages['ingrediente'].image : ''" alt="Echipa DULCE">
              <div class="gallery-overlay">
                <div class="overlay-content">
                </div>
              </div>
            </div>
            <div class="gallery-item">
              <img :src="aboutImages['pasiune'] ? aboutImages['pasiune'].image : ''" alt="Echipa DULCE">
              <div class="gallery-overlay">
                <div class="overlay-content">
                </div>
              </div>
            </div>
            <div class="gallery-item">
              <img :src="aboutImages['inovatie'] ? aboutImages['inovatie'].image : ''" alt="Echipa DULCE">
              <div class="gallery-overlay">
                <div class="overlay-content">
                </div>
              </div>
            </div>
            <div class="gallery-item">
              <img :src="aboutImages['excelenta'] ? aboutImages['excelenta'].image : ''" alt="Echipa DULCE">
              <div class="gallery-overlay">
                <div class="overlay-content">
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  </template>
  
  <script>
  import { getFirestore, collection, getDocs } from 'firebase/firestore';
  import { getApp } from 'firebase/app';
  
  // Se presupune că Firebase este deja inițializat în aplicație
  const db = getFirestore(getApp());
  
  export default {
    name: 'AboutPage',
    data() {
      return {
        aboutImages: {} // Imaginile vor fi populate din Firestore
      };
    },
    mounted() {
      this.loadImagesFromFirebase();
      this.initScrollAnimations();
      this.initParallaxEffect();
      this.initAdditionalAnimations();
    },
    methods: {
      async loadImagesFromFirebase() {
        try {
          const querySnapshot = await getDocs(collection(db, 'aboutus'));
          querySnapshot.forEach((doc) => {
            // Pentru fiecare document (ex: 'gif-biscuiti', 'gif-crema', etc.)
            this.aboutImages[doc.id] = doc.data();
          });
          console.log('Imagini încărcate din Firebase:', this.aboutImages);
        } catch (error) {
          console.error('Eroare la încărcarea imaginilor:', error);
        }
      },
      initScrollAnimations() {
        const elements = document.querySelectorAll('.section-title, .value-card, .timeline-item, .gallery-item');
        const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              entry.target.classList.add('animate');
            }
          });
        }, { threshold: 0.1 });
        elements.forEach(element => observer.observe(element));
      },
      initParallaxEffect() {
        const parallaxImages = document.querySelectorAll('.parallax-image');
        window.addEventListener('scroll', () => {
          const scrollPosition = window.pageYOffset;
          parallaxImages.forEach(image => {
            const imagePosition = image.getBoundingClientRect().top + scrollPosition;
            const offset = (scrollPosition - imagePosition) * 0.2;
            image.style.transform = `translateY(${offset}px)`;
          });
        });
      },
      initAdditionalAnimations() {
        const gifElements = document.querySelectorAll('.icon-gif, .timeline-gif');
        gifElements.forEach(gif => {
          gif.addEventListener('mouseenter', () => {
            gif.classList.add('hover-scale');
          });
          gif.addEventListener('mouseleave', () => {
            gif.classList.remove('hover-scale');
          });
        });
        const videoHeader = document.querySelector('.video-header');
        if (videoHeader) {
          window.addEventListener('scroll', () => {
            const scrollPos = window.pageYOffset;
            const headerHeight = videoHeader.offsetHeight;
            if (scrollPos < headerHeight) {
              const opacity = 1 - (scrollPos / headerHeight * 0.8);
              videoHeader.style.opacity = opacity;
            }
          });
        }
      },
      contactUs() {
        this.$router.push('/contact');
      }
    }
  }
  </script>
  
  <style scoped>
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes slideIn {
    from { transform: translateX(-30px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  
  @keyframes scaleIn {
    from { transform: scale(0.9); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
  }
  
  @keyframes floatAnimation {
    0% { transform: translateY(0) rotate(0deg); }
    50% { transform: translateY(-10px) rotate(2deg); }
    100% { transform: translateY(0) rotate(0deg); }
  }
  
  @keyframes pulseAnimation {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
  }
  
  /* Stiluri generale */
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  
  .about-page {
    font-family: 'Montserrat', 'Helvetica Neue', Helvetica, Arial, sans-serif;
    color: #333;
    line-height: 1.6;
    overflow-x: hidden;
  }
  
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
  }
  
  /* Header Video/Image */
  .video-header {
    position: relative;
    height: 85vh;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    background: center center/cover no-repeat;
    color: #fff;
    overflow: hidden;
    background-attachment: fixed;
    transition: all 0.5s ease;
  }
  
  .overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(to bottom, rgba(0, 0, 0, 0.6) 0%, rgba(0, 0, 0, 0.4) 100%);
    z-index: 1;
  }
  
  .header-content {
    position: relative;
    z-index: 2;
    max-width: 800px;
    padding: 0 20px;
  }
  
  .main-title {
    font-size: 5.5rem;
    font-weight: 300;
    margin-bottom: 20px;
    letter-spacing: 8px;
    animation: fadeIn 1.5s ease-out forwards;
    color: #fff;
    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  }
  
  .tagline {
    font-size: 1.6rem;
    font-weight: 300;
    margin-bottom: 30px;
    text-shadow: 0 1px 5px rgba(0, 0, 0, 0.3);
    animation: fadeIn 2s ease-out forwards;
    animation-delay: 0.5s;
  }
  
  /* Secțiuni */
  section {
    padding: 100px 0;
    position: relative;
  }
  
  .section-title {
    margin-bottom: 60px;
    position: relative;
  }
  
  .section-title .subtitle {
    display: block;
    font-size: 1.2rem;
    font-weight: 500;
    color: #b5838d;
    margin-bottom: 10px;
    text-transform: uppercase;
    letter-spacing: 3px;
  }
  
  .section-title h2 {
    font-size: 2.8rem;
    font-weight: 300;
    color: #333;
    padding-bottom: 15px;
    position: relative;
  }
  
  .section-title h2:after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 60px;
    height: 3px;
    background: #b5838d;
    transition: width 0.5s ease;
  }
  
  .section-title.centered {
    text-align: center;
  }
  
  .section-title.centered h2:after {
    left: 50%;
    transform: translateX(-50%);
  }
  
  section:hover .section-title h2:after {
    width: 100px;
  }
  
  /* Povestea */
  .story-section {
    background-color: #fff;
  }
  
  .story-content {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 40px;
  }
  
  .story-text {
    flex: 1;
    min-width: 300px;
  }
  
  .story-text .highlight {
    font-size: 1.5rem;
    line-height: 1.5;
    color: #b5838d;
    margin-bottom: 25px;
    font-weight: 300;
    padding-left: 20px;
    border-left: 3px solid #b5838d;
  }
  
  .story-text p {
    margin-bottom: 20px;
    font-size: 1.05rem;
  }
  
  .story-image {
    flex: 1;
    min-width: 300px;
  }
  
  .image-container {
    position: relative;
    overflow: hidden;
    border-radius: 12px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
    transition: transform 0.5s ease, box-shadow 0.5s ease;
  }
  
  .image-container:hover {
    transform: translateY(-10px);
    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.2);
  }
  
  .image-container img {
    width: 100%;
    height: auto;
    display: block;
    transition: transform 0.8s ease;
  }
  
  .image-container:hover img {
    transform: scale(1.05);
  }
  
  .parallax-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  /* Timeline */
  .process-section {
    background-color: #f9f9f9;
    position: relative;
  }
  
  .process-section:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: url('data:image/svg+xml;utf8,<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><circle cx="3" cy="3" r="1.5" fill="%23f8bbd0" fill-opacity="0.2"/><circle cx="13" cy="13" r="1.5" fill="%23f8bbd0" fill-opacity="0.2"/></svg>');
    opacity: 0.5;
  }
  
  .timeline {
    position: relative;
    max-width: 800px;
    margin: 0 auto;
  }
  
  .timeline:before {
    content: '';
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 2px;
    height: 100%;
    background: linear-gradient(to bottom, #e1e1e1 0%, #b5838d 100%);
  }
  
  .timeline-item {
    position: relative;
    display: flex;
    justify-content: flex-start;
    transition: all 0.5s ease;
    opacity: 0;
  }
  
  .timeline-item.animate {
    opacity: 1;
  }
  
  .timeline-item:nth-child(even) {
    justify-content: flex-end;
  }
  
  .timeline-icon {
    position: absolute;
    left: 50%;
    top: 0;
    transform: translateX(-50%);
    width: 80px;
    height: 80px;
    background: #fff;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2;
    box-shadow: 0 0 0 4px #b5838d, 0 0 20px rgba(0,0,0,0.1);
    overflow: hidden;
    transition: all 0.3s ease;
  }
  
  .timeline-icon:hover {
    transform: translateX(-50%) scale(1.1);
    box-shadow: 0 0 0 6px #b5838d, 0 0 30px rgba(0,0,0,0.2);
  }
  
  .timeline-gif {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .timeline-content {
    width: 45%;
    padding: 30px;
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 5px 25px rgba(0, 0, 0, 0.08);
    position: relative;
    transition: all 0.3s ease;
  }
  
  .timeline-content:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  }
  
  .timeline-content h3 {
    margin-bottom: 15px;
    color: #b5838d;
    font-size: 1.5rem;
    font-weight: 500;
  }
  
  .timeline-content p {
    font-size: 1.05rem;
  }
  
  .timeline-item:nth-child(odd) .timeline-content {
    animation: slideIn 0.8s ease-out forwards;
  }
  
  .timeline-item:nth-child(even) .timeline-content {
    animation: slideIn 0.8s ease-out forwards;
    animation-delay: 0.2s;
  }
  
  .timeline-content:before {
    content: '';
    position: absolute;
    width: 20px;
    height: 20px;
    background: #fff;
    transform: rotate(45deg);
    top: 30px;
    z-index: -1;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
  }
  
  .timeline-item:nth-child(odd) .timeline-content:before {
    right: -10px;
  }
  
  .timeline-item:nth-child(even) .timeline-content:before {
    left: -10px;
  }
  
  /* Carduri Valori */
  .values-section {
    background: linear-gradient(135deg, #fff5f8, #fff);
    position: relative;
    overflow: hidden;
  }
  
  .values-section:before {
    content: '';
    position: absolute;
    width: 300px;
    height: 300px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(194, 123, 160, 0.1) 0%, rgba(255, 255, 255, 0) 70%);
    top: -150px;
    right: -150px;
  }
  
  .values-section:after {
    content: '';
    position: absolute;
    width: 300px;
    height: 300px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(194, 123, 160, 0.1) 0%, rgba(255, 255, 255, 0) 70%);
    bottom: -150px;
    left: -150px;
  }
  
  .values-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 40px;
    position: relative;
    z-index: 1;
  }
  
  .value-card {
    background: #fff;
    border-radius: 12px;
    padding: 40px 25px;
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.05);
    text-align: center;
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    opacity: 0;
    transform: translateY(20px);
    position: relative;
    overflow: hidden;
  }
  
  .value-card:before {
    content: '';
    position: absolute;
    width: 100%;
    height: 5px;
    bottom: 0;
    left: 0;
    background: linear-gradient(to right, #b5838d, #9c27b0);
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 0.5s ease;
  }
  
  .value-card:hover:before {
    transform: scaleX(1);
  }
  
  .value-card.animate {
    animation: scaleIn 0.5s ease forwards;
  }
  
  .value-card:hover {
    transform: translateY(-15px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  }
  
  .value-icon {
    margin-bottom: 25px;
    animation: floatAnimation 3s ease-in-out infinite;
    height: 100px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .icon-gif {
    width: 100px;
    height: 100px;
    object-fit: cover;
    border-radius: 50%;
    transition: transform 0.3s ease;
  }
  
  .hover-scale {
    animation: pulseAnimation 2s infinite;
  }
  
  .value-card h3 {
    font-size: 1.5rem;
    margin-bottom: 20px;
    color: #b5838d;
    position: relative;
    display: inline-block;
  }
  
  .value-card h3:after {
    content: '';
    position: absolute;
    width: 40px;
    height: 2px;
    background: #b5838d;
    bottom: -10px;
    left: 50%;
    transform: translateX(-50%);
    transition: width 0.3s ease;
  }
  
  .value-card:hover h3:after {
    width: 60px;
  }
  
  .value-card p {
    font-size: 1.05rem;
    line-height: 1.6;
  }
  
  /* Galerie */
  .gallery-section {
    background-color: #fff;
    position: relative;
  }
  
  .gallery-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-auto-rows: 250px;
    gap: 25px;
  }
  
  .gallery-item {
    position: relative;
    overflow: hidden;
    border-radius: 12px;
    opacity: 0;
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
  }
  
  .gallery-item.animate {
    animation: fadeIn 0.8s ease forwards;
  }
  
  .gallery-item:hover {
    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.2);
    transform: translateY(-5px);
  }
  
  .gallery-item.large {
    grid-column: span 2;
    grid-row: span 2;
  }
  
  .gallery-item img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s ease;
  }
  
  .gallery-item:hover img {
    transform: scale(1.1);
  }
  
  .gallery-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0.2) 60%, rgba(0, 0, 0, 0) 100%);
    color: #fff;
    display: flex;
    align-items: flex-end;
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  .gallery-item:hover .gallery-overlay {
    opacity: 1;
  }
  
  .overlay-content {
    padding: 25px;
  }
  
  .overlay-content h4 {
    font-size: 1.5rem;
    margin-bottom: 8px;
    font-weight: 400;
  }
  
  .overlay-content p {
    font-size: 1rem;
    opacity: 0.9;
  }
  
  /* CTA Section */
  .cta-section {
    background: linear-gradient(135deg, #b5838d, #9c27b0);
    color: #fff;
    text-align: center;
    padding: 100px 0;
    position: relative;
    overflow: hidden;
  }
  
  .cta-section:before {
    content: '';
    position: absolute;
    width: 200px;
    height: 200px;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0) 70%);
    border-radius: 50%;
    top: -100px;
    right: 10%;
  }
  
  .cta-section:after {
    content: '';
    position: absolute;
    width: 150px;
    height: 150px;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0) 70%);
    border-radius: 50%;
    bottom: -50px;
    left: 5%;
  }
  
  .cta-content {
    max-width: 800px;
    margin: 0 auto;
    position: relative;
    z-index: 1;
  }
  
  .cta-content h2 {
    font-size: 2.8rem;
    font-weight: 300;
    margin-bottom: 25px;
    animation: fadeIn 1s ease-out;
  }
  
  .cta-content p {
    font-size: 1.3rem;
    margin-bottom: 40px;
    opacity: 0.9;
  }
  
  .cta-button {
    background: #fff;
    color: #b5838d;
    border: none;
    padding: 16px 42px;
    font-size: 1.1rem;
    border-radius: 50px;
    cursor: pointer;
    transition: all 0.3s ease;
    font-weight: 500;
    letter-spacing: 1px;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  }
  
  .cta-button:hover {
    background: rgba(255, 255, 255, 0.9);
    transform: translateY(-5px);
    box-shadow: 0 12px 25px rgba(0, 0, 0, 0.25);
  }
  
  /* Adaptabilitate */
  @media (max-width: 992px) {
    .timeline-content {
      width: 85%;
    }
    
    .timeline:before {
      left: 30px;
    }
    
    .timeline-icon {
      left: 30px;
    }
    
    .gallery-grid {
      grid-template-columns: 1fr 1fr;
    }
    
    .main-title {
      font-size: 4rem;
    }
    
    .cta-content h2 {
      font-size: 2.4rem;
    }
  }
  
  @media (max-width: 768px) {
    section {
      padding: 70px 0;
    }
    
    .story-content {
      flex-direction: column;
    }
    
    .gallery-grid {
      grid-template-columns: 1fr;
      grid-auto-rows: 220px;
    }
    
    .main-title {
      font-size: 3rem;
      letter-spacing: 4px;
    }
    
    .tagline {
      font-size: 1.3rem;
    }
    
    .section-title h2 {
      font-size: 2.2rem;
    }
    
    .story-text .highlight {
      font-size: 1.3rem;
    }
    
    .cta-content h2 {
      font-size: 2rem;
    }
    
    .cta-content p {
      font-size: 1.1rem;
    }
    
    .timeline-content:before {
      display: none;
    }
    
    .value-card {
      padding: 30px 20px;
    }
  }
  
  @media (max-width: 480px) {
    .main-title {
      font-size: 2.5rem;
      letter-spacing: 2px;
    }
    
    .tagline {
      font-size: 1.1rem;
    }
    
    .section-title h2 {
      font-size: 1.8rem;
    }
    
    .cta-button {
      padding: 12px 30px;
      font-size: 1rem;
    }
    
    .timeline-icon {
      width: 60px;
      height: 60px;
    }
    
    .timeline-content {
      padding: 20px;
    }
    
    .timeline-content h3 {
      font-size: 1.3rem;
    }
    
    .value-icon {
      height: 80px;
    }
    
    .icon-gif {
      width: 80px;
      height: 80px;
    }
  }

  /* Enhanced Media Queries for Timeline Section */

@media (max-width: 992px) {
  .timeline-content {
    width: 85%;
  }
  
  .timeline:before {
    left: 30px;
  }
  
  .timeline-icon {
    left: 30px;
    transform: translateX(0);
    width: 70px;
    height: 70px;
  }
  
  .timeline-item {
    justify-content: flex-start;
    padding-left: 80px;
    margin-bottom: 60px;
  }
  
  .timeline-item:nth-child(even) {
    justify-content: flex-start;
  }
  
  .timeline-item:nth-child(even) .timeline-content:before {
    right: -10px;
    left: auto;
  }
}

@media (max-width: 768px) {
  .timeline-content {
    width: calc(100% - 80px);
    padding: 25px 20px;
  }
  
  .timeline-icon {
    width: 60px;
    height: 60px;
  }
  
  .timeline-item {
    padding-left: 70px;
    margin-bottom: 50px;
  }
  
  .timeline-content h3 {
    font-size: 1.4rem;
    margin-bottom: 12px;
  }
  
  .timeline-content p {
    font-size: 1rem;
  }
  
  .timeline-content:before {
    display: none;
  }
}

@media (max-width: 480px) {
  .process-section {
    padding: 60px 0;
  }
  
  .timeline:before {
    left: 20px;
  }
  
  .timeline-icon {
    left: 20px;
    width: 50px;
    height: 50px;
  }
  
  .timeline-item {
    padding-left: 55px;
    margin-bottom: 40px;
  }
  
  .timeline-content {
    width: calc(100% - 60px);
    padding: 20px 15px;
  }
  
  .timeline-content h3 {
    font-size: 1.2rem;
    margin-bottom: 10px;
  }
  
  .timeline-content p {
    font-size: 0.95rem;
    line-height: 1.5;
  }
  
  .timeline-gif {
    width: 100%;
    height: 100%;
  }
}

@media (max-width: 360px) {
  .timeline-icon {
    width: 40px;
    height: 40px;
    left: 15px;
  }
  
  .timeline-item {
    padding-left: 45px;
  }
  
  .timeline:before {
    left: 15px;
  }
  
  .timeline-content {
    width: calc(100% - 50px);
    padding: 15px;
  }
  
  .timeline-content h3 {
    font-size: 1.1rem;
  }
}
  </style>
  