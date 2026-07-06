// Lista di nuovi URL per sostituire le immagini
const newImageUrls = [
  'https://res.cloudinary.com/demo/image/upload/w_600/photo1.jpg', // esempio di link per la prima foto
  'https://res.cloudinary.com/demo/image/upload/w_600/photo2.jpg', // esempio di link per la seconda foto
  'https://res.cloudinary.com/demo/image/upload/w_600/photo3.jpg' // esempio di link per la terza foto
];

// Funzione per sostituire le immagini
function updateGalleryPhotos() {
  const galleryContainer = document.getElementById('gallery'); // Assumendo che ci sia un elemento con id 'gallery'
  const images = galleryContainer.getElementsByTagName('img');
  for (let i = 0; i < images.length && i < newImageUrls.length; i++) {
    images[i].src = newImageUrls[i]; // Sostituisce l'URL dell'immagine
    images[i].style.objectFit = 'contain'; // Assicurati di visualizzare l'immagine intera
  }
}

updateGalleryPhotos();