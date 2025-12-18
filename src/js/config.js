/**
 * Site Configuration
 * Change BASE_URL when deploying to production domain
 */
const CONFIG = {
  // Current: GitHub Pages | Production: https://oskargajcowski.pl
  BASE_URL: 'https://domindev.github.io/DominDev-OG',

  // Contact Information
  PHONE: '+48 784 036 721',
  PHONE_LINK: '48784036721',
  WHATSAPP_MESSAGE: 'Cześć! Chciałbym umówić się na trening.',

  // Social Media
  INSTAGRAM: 'https://www.instagram.com/oskar.gajcowski',
  FACEBOOK: 'https://www.facebook.com/profile.php?id=100086608413722',

  // Location
  ADDRESS: 'Klub Sportowy Awangarda 71, ul. Ołbińska 19b, 50-233 Wrocław',
  GYM_NAME: 'Awangarda 71 Gym',

  // Google Maps
  MAPS_EMBED: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2504.656779354728!2d17.03755331575567!3d51.11475797957262!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x470fc2765b44e4a1%3A0x9f4f2c7d8e4a7b2c!2sAwangarda%2071!5e0!3m2!1spl!2spl!4v1703001234567!5m2!1spl!2spl',

  // Coordinates for schema.org
  LATITUDE: '51.114757',
  LONGITUDE: '17.037553'
};

// Generate WhatsApp URL
CONFIG.WHATSAPP_URL = `https://wa.me/${CONFIG.PHONE_LINK}?text=${encodeURIComponent(CONFIG.WHATSAPP_MESSAGE)}`;

// Export for use in other scripts (if using modules)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONFIG;
}
