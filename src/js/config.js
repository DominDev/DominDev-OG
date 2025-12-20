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
  ADDRESS: 'ul. Ołbińska 17/budynek B, 50-233 Wrocław',

  // Google Maps (centered on training location, interaction disabled via CSS)
  MAPS_EMBED: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2504.17918848146!2d17.035887777206046!3d51.12360273866776!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x470fe9c2ef08120f%3A0x39db8972a47e5d8a!2zT8WCYmnFhHNrYSAxNy9idWR5bmVrIEIsIDUwLTIzMyBXcm9jxYJhdw!5e0!3m2!1spl!2spl!4v1766189125955!5m2!1spl!2spl',
  MAPS_NAV: 'https://maps.app.goo.gl/gaE43iy71KP4hoXK6',

  // Coordinates for schema.org (ul. Ołbińska 17/B)
  LATITUDE: '51.12360',
  LONGITUDE: '17.03589'
};

// Generate WhatsApp URL
CONFIG.WHATSAPP_URL = `https://wa.me/${CONFIG.PHONE_LINK}?text=${encodeURIComponent(CONFIG.WHATSAPP_MESSAGE)}`;

// Export for use in other scripts (if using modules)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONFIG;
}
